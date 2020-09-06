const axios = require('axios');
const parser = require('node-html-parser');

const dbUrl = "http://localhost:9999";
const dbName = "ipo";
const adminDbName = "ipo_admin";
const userStatsDbName = "ipo_user_stats";
const overviewStatsDbName = "ipo_stats";

class DbAccess {
    constructor(dbUrl, dbName) {
        this.dbUrl = dbUrl;
        this.dbName = dbName;
    }

    initDb() {
        //Create the collection
        this.makeDbRequest("POST", "/collections", {
            "name": this.dbName
        });
    }

    async writeData(data) {
        let res = await this.makeDbRequest("POST", `/collections/${this.dbName}/create`, data)
        return res.data.id;
    }

    async readData(query) {
        let res = await this.makeDbRequest("GET", `/collections/${this.dbName}/read`, query)
        return res.data;
    }

    async updateData(objId, patch) {
        let res = await this.makeDbRequest("PATCH", `/collections/${this.dbName}/${objId}`, patch)
        return res.data;
    }

    async getOrCreate(name) {
        let res = await this.readData({"varName": name});
        if (this.isFail(res)) {
            return this.writeData({"varName": name, "value": ""});
        }
        return res[0].id;
    }

    isFail(res) {
        return Object.keys(res).length === 0 || res.hasOwnProperty("error");
    }

    makeDbRequest(method, path, data) {
        /*
        switch (method) {
            case "GET":
                axiosFunc = axios.get;
                break;
            case "POST":
                axiosFunc = axios.post;
                break;
            case "PUT":
                axiosFunc = axios.put;
                break;
            case "PATCH":
                axiosFunc = axios.patch;
                break;
            case "DELETE":
                axiosFunc = axios.delete;
                break;
            default:
                console.error("Unknown method " + method);
                return;
        }*/
        console.log(`${this.dbUrl}${path} -> ${data}`);

        return axios({
            url: this.dbUrl + path,
            method: method,
            data: data
        })
    }
}

class IpoApiFetcher {
    constructor(tagger) {
        this.loadDailyDataToDb = this.loadDailyDataToDb.bind(this);
        this.dbHandle = new DbAccess(dbUrl, dbName);
        this.dbHandle.initDb();
        this.adminDbHandle = new DbAccess(dbUrl, adminDbName);
        this.adminDbHandle.initDb();
        this.tagger = tagger;
        this.dataToSend = [];
    }

    async getIpos(date) { //here i should sort the information.
        //TODO later, well soon probably, we'll need to only return ipos in a certain date range, as we'll have too many ipos in the db to send them all back
        //or even load them progressively.
        let allIpoInfo = await this.dbHandle.readData({})
        let dataToSendToFront = [];

        for (let i = 0; i < allIpoInfo.length; i++) {
            let overview = allIpoInfo[i].ipoOverview.poOverview;
            let financial = allIpoInfo[i].financial;
            let description = this.stripCompanyDescription(allIpoInfo[i].ipoOverview.companyInformation.companyDescription);
            let companyInfo = {
                "name": overview.CompanyName.value,
                "ticker": overview.Symbol.value,
                "marketcap": this.calculateMarketCap(overview.ProposedSharePrice.value, overview.SharesOutstanding.value),
                "description": description,
                "tags": allIpoInfo[i].tags, // not done yet
                "status": overview.DealStatus.value,
                "date": allIpoInfo[i].ipoDate,
                "ceo": overview.CEO.value,
                "url": this.extractUrl(overview.CompanyWebsite.value),
                "id": allIpoInfo[i].id,
                "revenue": financial.financials[0].Revenue.value,
                "income": financial.financials[0].NetIncome.value,
                "stockholdersEquity": financial.financials[0].StockholdersEquity.value,
                "filings": this.sortFilings(financial.filings),
                "exchange": overview.Exchange.value,
            }
            dataToSendToFront.push(companyInfo);
        }
        return dataToSendToFront
    }

    async loadDailyDataToDb() {
        let lastWriteId = await this.adminDbHandle.getOrCreate("lastWrite");
        let lastWriteObj = await this.adminDbHandle.readData({"id": lastWriteId});
        let lastWriteTime = lastWriteObj[0].value;
        let currentTime = new Date().getTime();
        let delta = (currentTime - lastWriteTime)/(1000*60*60);
        console.log(`lastWriteObj = ${JSON.stringify(lastWriteObj)}, lastWriteTime = ${lastWriteTime}, delta = ${delta}`);
        if (delta < 0.001) {
            console.log("It has been less than 10 hours since last write - skip");
            this.getIpos();
            return;
        }

        let ipos = await this.getIpoInformation();
        ipos.map(ipo => this.dbHandle.writeData(ipo));
        
        this.adminDbHandle.updateData(lastWriteId, {"value": currentTime});
        console.log("Wrote daily data");
    }

    

    async getIpoInformation() {
        let date = getDate();
        date = "2020-09";
        let url = `https://api.nasdaq.com/api/ipo/calendar?date=${date}`;
	    console.log("Fetching initial data...");
        let res = await axios.get(url)
        let ipos = [];
        let pricedInCompanyInfo = res.data.data.priced.rows;
        if (pricedInCompanyInfo != null) {
            for (let item in pricedInCompanyInfo) {
                console.log(".");
                let dealDetails = await this.getDealDetails(pricedInCompanyInfo[item].dealID, pricedInCompanyInfo[item]);
                ipos.push(dealDetails);
            }
        }

        let upcomingCompanyInfo = res.data.data.upcoming.upcomingTable.rows;
        if (upcomingCompanyInfo != null) {
            for (let item in upcomingCompanyInfo) {
                console.log("/");
                let dealDetails = await this.getDealDetails(upcomingCompanyInfo[item].dealID, upcomingCompanyInfo[item]);
                ipos.push(dealDetails);
            }
        }

        let filedCompanyInfo = res.data.data.filed.rows;
        if (filedCompanyInfo != null) {
            for (let item in filedCompanyInfo) {
                console.log(";");
                let dealDetails = await this.getDealDetails(filedCompanyInfo[item].dealID, filedCompanyInfo[item]);
                ipos.push(dealDetails);
            }
        }   

        return ipos;
    }

    async getDealDetails(dealID, companyData) { //rewrite the sorting in a new function
        let res = await axios.get(`https://api.nasdaq.com/api/ipo/overview/?dealId=${dealID}`)
        let ipoOverview = res.data.data;
        let financial_data = await axios.get(`https://api.nasdaq.com/api/ipo/financials-filings/?dealId=${dealID}`);
        financial_data = financial_data.data.data;
        let description = this.stripCompanyDescription(res.data.data.companyInformation.companyDescription);
        let associatedTags = this.tagger.determineTags(description);
        let dataObject = this.cleanData(dealID, companyData, associatedTags, ipoOverview, financial_data);
        return dataObject;
    }

    cleanData(dealID, companyData, associatedTags, ipoOverview, financial_data) {
        delete financial_data.companyInformation;
        delete financial_data.dealID;
        for (let i = 0; i < financial_data.filings.length; i++) {
            delete financial_data.filings[i].CompanyName;
        }
        delete ipoOverview.poOverview.DealId;
        let ipoDate = this.getIpoDate(ipoOverview.poOverview.DealStatus.value, companyData)
        return {id: dealID, tags: associatedTags, ipoOverview, ipoDate, financial: financial_data}
    }

    sortFilings(filings) {
        let list_of_filings = [];
        for (let i = 0; i < filings.length; i++) {
            let formType = filings[i].FormType.value;
            let link = filings[i].FilingLink.value;
            let date = filings[i].DateReceived.value;
            //Not a big fan of this list, would prefer key/value object
            list_of_filings.push([formType, link, date])
        }
        return list_of_filings;
    }

    getIpoDate(status, data) {
        if (status === "Filed") {
            if (data.expectedPriceDate == undefined) {
                return {value: "No date set", isDateSet: false};
            } else {
                return {value: data.expectedPriceDate, isDateSet: true};
            }
        }
        else if (status === "Priced") {
            if (data.expectedPriceDate == undefined && data.pricedDate == undefined) {
                return {value: "No date set", isDateSet: false}
            }
            return {value: data.pricedDate || data.expectedPriceDate, isDateSet: true};
        }
    }

    calculateMarketCap(sharePrice, sharesOutstanding) {
        sharePrice = parseInt(sharePrice.substr(1, sharePrice.length).replace(",", ""), 10);
        sharesOutstanding = parseInt(sharesOutstanding.replace(/,/g, ""), 10);
        let marketCap = "$ " +(Math.floor(sharePrice * sharesOutstanding / 1000000)).toLocaleString() + "M";
        return marketCap;
    }

    stripCompanyDescription(description) {
        //Remove trailing \n (and possible more operations later on)
        return description.replace(/\n/g, " ");
    }

    extractUrl(rawUrlData) {
        //The API returns a string representation of an a tag. Parse it 
        //and extract the href.
        //<a href='http://www.oakstreethealth.com' target='_blank'>www.oakstreethealth.com</a>
        const root = parser.parse(rawUrlData);
        const aTag = root.firstChild;
        const tentativeA = aTag.firstChild;
        if (tentativeA == null) {
            return ""
        }
        return tentativeA.rawText
    }
}

class StatTracker {
    constructor() {
        this.dbHandle = new DbAccess(dbUrl, userStatsDbName);
        this.dbHandle.initDb();
    }

    async logIp(ip) {
        //fetch data. If it is there, increase by 1. If not, create and set count to 1
        let res = await this.dbHandle.readData({id: ip});

        //Write or update data depending on response
        if (this.dbHandle.isFail(res)) {
            console.log(`Writing fresh obj with id ${ip}`);
            this.dbHandle.writeData({
                id: ip,
                count: 1
            });
        } else {
            res = res[0];
            console.log(res);
            console.log(`Updating existing obj with count ${res.count + 1}`);
            this.dbHandle.updateData(ip, {
                count: res.count + 1
            });
        }
    }
}

function getDate() {
    let date = new Date();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();
    return year + "-" + month;
}

module.exports = {
    DbAccess,
    IpoApiFetcher,
    StatTracker,
    dbUrl,
    dbName,
    overviewStatsDbName
}

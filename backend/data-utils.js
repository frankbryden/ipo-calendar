const express = require('express');
const axios = require('axios');

const dbName = "ipo";

class DbAccess {
    constructor(dbUrl) {
        this.dbUrl = dbUrl;
    }

    initDb() {
        //Create the collection
        this.makeDbRequest("POST", "/collections", {
            "name": dbName
        })
    }

    async writeData(data) {
        let res = await this.makeDbRequest("POST", `/collections/${dbName}/create`, data)
        return res.data.id;
    }

    async readData(query) {
        let result = await this.makeDbRequest("GET", `/collections/${dbName}/read`, query)
        return res.data;
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
        this.dbHandle = new DbAccess("http://localhost:80");
        this.dbHandle.initDb();
        this.tagger = tagger;
        this.dataToSend = [];
    }

    async loadDailyDataToDb() {
        let ipos = [
            {
              name: 'CureVac N.V.',
              marketcap: 'US$2,815,491,264.00',
              description: 'We are a global clinical-stage biopharmaceutical company developing a new class of transformative medicines based on messenger ribonucleic acid that has the potential to improve the lives of people',
              tags: [],
              status: 'Priced',
              date: '08/14/2020'
            },
            {
              name: 'DUCK CREEK TECHNOLOGIES, INC.',
              marketcap: 'US$3,464,478,432.00',
              description: 'Our Mission  We empower property and casualty insurance carriers to transform their information technology, business practices, insurance products, and customer experiences, making their organizations stronger and their customers safer and more satisfied',
              tags: [ [Object] ],
              status: 'Priced',
              date: '08/14/2020'
            },
            {
              name: 'Nano-X Imaging Ltd.',
              marketcap: 'US$663,243,728.00',
              description: 'Early detection saves lives—and we at Nanox are focused on applying our proprietary medical imaging technology to make diagnostic medicine more accessible and affordable across the globe',
              tags: [],
              status: 'Filed',
              date: '08/21/2020'
            },
            {
              name: 'Harmony Biosciences Holdings, Inc.',
              marketcap: 'US$1,259,610,800.00',
              description: 'We are a commercial-stage pharmaceutical company focused on developing and commercializing innovative therapies for patients living with rare neurological disorders who have unmet medical needs',
              tags: [],
              status: 'Filed',
              date: '08/19/2020'
            },
            {
              name: 'North Mountain Merger Corp.',
              marketcap: 'US$143,750,000.00',
              description: 'We are a newly incorporated blank check company formed as a Delaware corporation for the purpose of effecting a merger, capital stock exchange, asset acquisition, stock purchase, reorganization or similar business combination with one or more businesses, which we refer to throughout this prospectus as our initial business combination',
              tags: [],
              status: 'Filed',
              date: 'No date set'
            },
            {
              name: 'Brookline Capital Acquisition Corp.',
              marketcap: 'US$64,250,000.00',
              description: 'We are a newly organized, blank check company formed as a Delaware corporation for the purpose of effecting a merger, capital stock exchange, asset acquisition, stock purchase, reorganization or similar business combination, which we refer to throughout this prospectus as our initial business combination, with one or more businesses, which we refer to throughout this prospectus as target businesses',
              tags: [],
              status: 'Filed',
              date: 'No date set'
            }
          ];//await this.getIpoInformation();
        console.log(`Got ${ipos.length} ipos`);
        this.dataToSend = ipos;
        this.sendData();

        //ipos.map(ipo => this.dbHandle.writeData(ipo));
    }

    sendData() {
        console.log(`Still ${this.dataToSend.length} items to send`)
        let data = this.dataToSend.pop();
        console.log(`Now ${this.dataToSend.length} items to send`)
        this.dbHandle.writeData({...data});
        if (this.dataToSend.length > 0) {
            setTimeout(() => this.sendData(), 200);
        }
    }

    async getIpoInformation() {
        let date = getDate();
        let url = `https://api.nasdaq.com/api/ipo/calendar?date=${date}`;

        let res = await axios.get(url)
        let ipos = [];
        let pricedInCompanyInfo = res.data.data.priced.rows;
        for (let item in pricedInCompanyInfo.slice(0, 2)) {
            let dealDetails = await this.getDealDetails(pricedInCompanyInfo[item].dealID, pricedInCompanyInfo[item]);
            ipos.push(dealDetails);
        }

        let upcomingCompanyInfo = res.data.data.upcoming.upcomingTable.rows;
        for (let item in upcomingCompanyInfo.slice(0, 2)) {
            let dealDetails = await this.getDealDetails(upcomingCompanyInfo[item].dealID, upcomingCompanyInfo[item]);
            ipos.push(dealDetails);
        }

        let filedCompanyInfo = res.data.data.filed.rows;
        for (let item in filedCompanyInfo.slice(0, 2)) {
            let dealDetails = await this.getDealDetails(filedCompanyInfo[item].dealID, filedCompanyInfo[item]);
            ipos.push(dealDetails);
        }

        return ipos;
    }

    async getDealDetails(dealID, companyData) {
        let res = await axios.get(`https://api.nasdaq.com/api/ipo/overview/?dealId=${dealID}`)
        let ipoOverview = res.data.data.poOverview;
        let description = this.stripCompanyDescription(res.data.data.companyInformation.companyDescription);
        let associatedTags = this.tagger.determineTags(description);

        let companyInfo = {
            "name": ipoOverview.CompanyName.value,
            "marketcap": this.calculateMarketCap(ipoOverview.ProposedSharePrice.value, ipoOverview.SharesOutstanding.value),
            "description": this.createCompanySummary(description),
            "tags": associatedTags, // not done yet
            "status": ipoOverview.DealStatus.value,
            "date": this.getIpoDate(ipoOverview.DealStatus.value, companyData), //headache inducing
        }
        return companyInfo;
    }

    getIpoDate(status, data) {
        if (status === "Filed") {
            if (data.expectedPriceDate == undefined) {
                return "No date set";
            } else {
                return data.expectedPriceDate;
            }
        }
        else if (status === "Priced") {
            return data.pricedDate;
        }
    }

    calculateMarketCap(sharePrice, sharesOutstanding) {
        sharePrice = parseInt(sharePrice.substr(1, sharePrice.length).replace(",", ""), 10);
        sharesOutstanding = parseInt(sharesOutstanding.replace(/,/g, ""), 10);
        let marketCap = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD' }).format(sharePrice * sharesOutstanding);
        return marketCap;
    }

    stripCompanyDescription(description) {
        //Remove trailing \n (and possible more operations later on)
        return description.replace(/\n/g, " ");
    }

    createCompanySummary(fullDescription) {
        let arrayOfDescriptionLines = fullDescription.split(". ");
        let quickDescription = arrayOfDescriptionLines[0];
        return quickDescription;
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
    IpoApiFetcher
}
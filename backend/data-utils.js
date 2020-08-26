const express = require('express');
const axios = require('axios');

const dbUrl = "http://localhost:80";
const dbName = "ipo";
const adminDbName = "ipo_admin";

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
        let res = await this.makeDbRequest("PATCH", `/collections/ipo_admin/${objId}`, patch)
        return res.data;
        
    }

    async getOrCreate(name) {
        let res = await this.readData({"varName": name});
        if (Object.keys(res).length === 0) {
            return this.writeData({"varName": name, "value": ""});
        }
        return res[0].id;
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
        this.dbHandle = new DbAccess(dbUrl, dbName);
        this.dbHandle.initDb();
        this.adminDbHandle = new DbAccess(dbUrl, adminDbName);
        this.adminDbHandle.initDb();
        this.tagger = tagger;
        this.dataToSend = [];
    }

    async getIpos(date) {
        //TODO later, well soon probably, we'll need to only return ipos in a certain date range, as we'll have too many ipos in the db to send them all back
        //or even load them progressively.
        return this.dbHandle.readData("{}")
    }

    async loadDailyDataToDb() {
        let lastWriteId = await this.adminDbHandle.getOrCreate("lastWrite");
        let lastWriteObj = await this.adminDbHandle.readData({"id": lastWriteId});
        let lastWriteTime = lastWriteObj[0].value;
        let currentTime = new Date().getTime();
        let delta = (currentTime - lastWriteTime)/(1000*60*60);
        console.log(`lastWriteObj = ${JSON.stringify(lastWriteObj)}, lastWriteTime = ${lastWriteTime}, delta = ${delta}`);
        if (delta < 10) {
            console.log("It has been less than 10 hours since last write - skip");
            return;
        }

        let ipos = await this.getIpoInformation();
        ipos.map(ipo => this.dbHandle.writeData(ipo));
        
        this.adminDbHandle.updateData(lastWriteId, {"value": currentTime});
        console.log("Wrote daily data");
    }

    

    async getIpoInformation() {
        let date = getDate();
        let url = `https://api.nasdaq.com/api/ipo/calendar?date=${date}`;

        let res = await axios.get(url)
        let ipos = [];
        let pricedInCompanyInfo = res.data.data.priced.rows;
        for (let item in pricedInCompanyInfo.slice(0, 5)) {
            let dealDetails = await this.getDealDetails(pricedInCompanyInfo[item].dealID, pricedInCompanyInfo[item]);
            ipos.push(dealDetails);
        }

        let upcomingCompanyInfo = res.data.data.upcoming.upcomingTable.rows;
        for (let item in upcomingCompanyInfo.slice(0, 5)) {
            let dealDetails = await this.getDealDetails(upcomingCompanyInfo[item].dealID, upcomingCompanyInfo[item]);
            ipos.push(dealDetails);
        }

        let filedCompanyInfo = res.data.data.filed.rows;
        for (let item in filedCompanyInfo.slice(0, 5)) {
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
            "ceo": ipoOverview.CEO.value,
            "url": ipoOverview.CompanyWebsite.value,
            "id": dealID
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
        let marketCap = "$ " +(Math.floor(sharePrice * sharesOutstanding / 1000000)).toLocaleString() + "M";
        return marketCap;
    }

    stripCompanyDescription(description) {
        //Remove trailing \n (and possible more operations later on)
        return description.replace(/\n/g, " ");
    }

    createCompanySummary(fullDescription) {
        // let arrayOfDescriptionLines = fullDescription.split(". ");
        // let quickDescription = arrayOfDescriptionLines[0];
        let quickDescription = fullDescription.slice(0, 350) + "...";
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
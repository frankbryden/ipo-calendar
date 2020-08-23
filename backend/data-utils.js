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
        let res = await this.makeDbRequest("GET", `/collections/${dbName}/read`, query)
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

    async getIpos(date) {
        //TODO later, well soon probably, we'll need to only return ipos in a certain date range, as we'll have too many ipos in the db to send them all back
        //or even load them progressively.
        return this.dbHandle.readData("{}")
    }

    async loadDailyDataToDb() {
        let ipos = await this.getIpoInformation();
        ipos.map(ipo => this.dbHandle.writeData(ipo));
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
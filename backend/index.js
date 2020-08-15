const express = require('express');
const axios = require('axios');
const app = express();

const status = ["PricedIn", "Upcoming", "Filed"];
const tags = ["Fintech", "Machine Learning", "Blockchain", "Deep Learning", "Cryptocurrency"];

const port = 5000;
app.listen(port);

app.get('/ipos', (req, res) => {
    getIpoInformation(res);
})

function getIpoInformation(response) {
    let date = getDate();
    let url = `https://api.nasdaq.com/api/ipo/calendar?date=${date}`;

    axios.get(url).then(async (res) => {
        let ipos = [];
        let pricedInCompanyInfo = res.data.data.priced.rows;
        for (item in pricedInCompanyInfo.slice(0, 2)) {
            let dealDetails = await getDealDetails(pricedInCompanyInfo[item].dealID, pricedInCompanyInfo[item]);
            ipos.push(dealDetails);
        }

        let upcomingCompanyInfo = res.data.data.upcoming.upcomingTable.rows;
        for (item in upcomingCompanyInfo.slice(0, 2)) {
            let dealDetails = await getDealDetails(upcomingCompanyInfo[item].dealID, upcomingCompanyInfo[item]);
            ipos.push(dealDetails);
        }

        let filedCompanyInfo = res.data.data.filed.rows;
        for (item in filedCompanyInfo.slice(0, 2)) {
            let dealDetails = await getDealDetails(filedCompanyInfo[item].dealID, filedCompanyInfo[item]);
            ipos.push(dealDetails);
        }
        console.log(ipos);
        response.json({"ipos": ipos});
    })
}

async function getDealDetails(dealID, data) {
    let res = await axios.get(`https://api.nasdaq.com/api/ipo/overview/?dealId=${dealID}`)
    let ipoOverview = res.data.data.poOverview;
    let companyInfo = {
        "name": ipoOverview.CompanyName.value,
        "marketcap": calculateMarketCap(ipoOverview.ProposedSharePrice.value, ipoOverview.SharesOutstanding.value),
        "description": createCompanyDescription(res.data.data.companyInformation.companyDescription),
        "tags": ["Fintech", "Machine Learning"], // not done yet
        "status": ipoOverview.DealStatus.value,
        "date": getIpoDate(ipoOverview.DealStatus.value, data), //headache inducing
    }
    return companyInfo;
}

function getIpoDate(status, data) {
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

function calculateMarketCap(sharePrice, sharesOutstanding) {
    sharePrice = parseInt(sharePrice.substr(1, sharePrice.length).replace(",", ""), 10);
    sharesOutstanding = parseInt(sharesOutstanding.replace(/,/g, ""), 10);
    let marketCap = sharePrice * sharesOutstanding;
    return marketCap;

}

function createCompanyDescription(fullDescription) {
    fullDescription = fullDescription.replace(/\n/g, " ");
    arrayOfDescriptionLines = fullDescription.split(". ");
    for (item in arrayOfDescriptionLines) {  
        arrayOfDescriptionLines[item] = arrayOfDescriptionLines[item] + ". ";
    }
    quickDescription = arrayOfDescriptionLines[0];
    return quickDescription;
}

function getDate() {
    let date = new Date();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();
    return year + "-" + month;
}


app.get('/status', (req, res) => {
    res.json(status);
})

app.get('/tags', (req, res) => {
    res.json(tags);
})

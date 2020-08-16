const express = require('express');
const axios = require('axios');
const app = express();
const tagprocessing =  require('./tag-processing.js');

//Status
const statusTitles = ["PricedIn", "Upcoming", "Filed"];
const statusColours = ["#d2fdff","#3abeff","#29bf12"];
let status = [];
for (let i = 0; i < statusTitles.length; i++) {
    status.push({
        "name": statusTitles[i],
        "color": statusColours[i]
    });
}
console.log(status);
//Tags
const tagTitles = [
    {
        "title": "Fintech",
        "keywords": ["financial technology", "fintech"]
    },
    {
        "title": "Machine Learning",
        "keywords": ["machine learning", "ml"]
    },
    {
        "title": "Blockchain",
        "keywords": ["blockchain", "ledger"]
    },
    {
        "title": "Deep Learning",
        "keywords": ["deep learning", "dl"]
    },
    {
        "title": "Cryptocurrency",
        "keywords": ["cryptocurrency", "crypto", "wallet"]
    },
    {
        "title": "SPAC",
        "keywords": ["SPAC", "blank check", "company acquisition"]
    },
    {
        "title": "EV",
        "keywords": ["ev", "electric vehicle"]
    },
    {
        "title": "Biotech",
        "keywords": ["biotechnology", "biotech"]
    }
];

const tagColours = ["#f2dc5d","#f2a359","#db9065","#a4031f","#240b36","#51bbfe","#9055a2", "#5EA570"];
let tags = [];
for (let i = 0; i < tagTitles.length; i++) {
    tags.push({
        "name": tagTitles[i].title,
        "keywords": tagTitles[i].keywords,
        "color": tagColours[i]
    });
}

console.log(tags);
//Tagging object
let myTagger = new tagprocessing.TagProcessing(tags);

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
        response.json({"ipos": ipos});
    })
}

async function getDealDetails(dealID, companyData) {
    let res = await axios.get(`https://api.nasdaq.com/api/ipo/overview/?dealId=${dealID}`)
    let ipoOverview = res.data.data.poOverview;
    let description = stripCompanyDescription(res.data.data.companyInformation.companyDescription);
    let associatedTags = myTagger.determineTags(description);

    let companyInfo = {
        "name": ipoOverview.CompanyName.value,
        "marketcap": calculateMarketCap(ipoOverview.ProposedSharePrice.value, ipoOverview.SharesOutstanding.value),
        "description": createCompanySummary(description),
        "tags": associatedTags, // not done yet
        "status": ipoOverview.DealStatus.value,
        "date": getIpoDate(ipoOverview.DealStatus.value, companyData), //headache inducing
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
    let marketCap = new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'USD'}).format(sharePrice * sharesOutstanding);
    return marketCap;
}

function stripCompanyDescription(description) {
    //Remove trailing \n (and possible more operations later on)
    return description.replace(/\n/g, " ");
}

function createCompanySummary(fullDescription) {
    let arrayOfDescriptionLines = fullDescription.split(". ");
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
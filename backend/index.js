const express = require('express');
const axios = require('axios');
const app = express();

// axios.interceptors.request.use(request => {
//     console.log('Starting Request', request)
//     return request
//   })
  
//   axios.interceptors.response.use(response => {
//     console.log('Response:', response)
//     return response
//   })

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
        for (item in pricedInCompanyInfo.slice(0, 4)) {
            let dealDetails = await getDealDetails(pricedInCompanyInfo[item].dealID);
            ipos.push(dealDetails);
        }
        console.log(ipos);
        response.json({"ipos": ipos});
    })
}

async function getDealDetails(dealID) {
    let res = await axios.get(`https://api.nasdaq.com/api/ipo/overview/?dealId=${dealID}`)
    let ipoOverview = res.data.data.poOverview;
    let companyInfo = {
        "name": ipoOverview.CompanyName.value,
        "marketcap": calculateMarketCap(ipoOverview.ProposedSharePrice.value, ipoOverview.SharesOutstanding.value),
        "description": createCompanyDescription(res.data.data.companyInformation.companyDescription),
        "tags": ["Fintech", "Machine Learning"], // not done yet
        "status": ipoOverview.DealStatus.value,
    }
    return companyInfo;
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
    for (item in arrayOfDescriptionLines) {  //maybe useless code not sure.
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


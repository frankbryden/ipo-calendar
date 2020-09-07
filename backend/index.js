const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const tagprocessing = require('./tag-processing.js');
const dataUtils = require('./data-utils.js');
const requestIp = require('request-ip');
const statsLib = require('./overview-stats.js');

//Status
const statusTitles = ["Priced", "Upcoming", "Filed"];
const statusColours = ["#d2fdff","#3abeff","#29bf12"];
let status = [];
for (let i = 0; i < statusTitles.length; i++) {
    status.push({
        "name": statusTitles[i],
        "color": statusColours[i]
    });
}

//Tags
const tagTitles = [
    {
        "title": "Fintech",
        "keywords": [/financial technology/gm, /fintech/gm]
    },
    {
        "title": "Machine Learning",
        "keywords": [/machine learning/gm, /ml/gm]
    },
    {
        "title": "Blockchain",
        "keywords": [/blockchain/gm, /ledger/gm]
    },
    {
        "title": "Deep Learning",
        "keywords": [/deep learning/gm, /dl/gm]
    },
    {
        "title": "Cryptocurrency",
        "keywords": [/cryptocurrency/gm, /crypto/gm, /wallet/gm]
    },
    {
        "title": "SPAC",
        "keywords": [/ SPAC[ \.]/gm, /blank check/gm, /company acquisition/gm]
    },
    {
        "title": "EV",
        "keywords": [/ ev[ \.]/gm, /electric vehicle/gm]
    },
    {
        "title": "Biotech",
        "keywords": [/biotechnology/gm, /biotech/gm]
    },
    {
        "title": "Healthcare",
        "keywords": [/medical/gm, /biopharmaceutical/gm]   
    },
    {
        "title": "AI",
        "keywords": [/artificial intelligence/gm, /AI/gm]   
    },
    {
        "title": "Cannabis",
        "keywords": [/cannabis/gm]   
    }
    
];

const tagColours = ["#f2dc5d","#f2a359","#db9065","#a4031f","#240b36","#51bbfe","#9055a2", "#5EA570", "#7AC74F", "#E87461", "#738d76"];
let tags = [];
for (let i = 0; i < tagTitles.length; i++) {
    tags.push({
        "name": tagTitles[i].title,
        "keywords": tagTitles[i].keywords,
        "color": tagColours[i]
    });
}

//Tagging object
let myTagger = new tagprocessing.TagProcessing(tags);
let apiFetcher = new dataUtils.IpoApiFetcher(myTagger);

//Stat tracker
let statTracker = new dataUtils.StatTracker();

//Overview stats
let overviewStats = new statsLib.OverviewStatsGen();

apiFetcher.loadDailyDataToDb().then(() => {
    console.log("IPO db operations done, moving onto to overview stats...");
    overviewStats.updateStats();
});

const port = 5000;

app.use(requestIp.mw())
app.use(cors())

app.listen(port);

app.get('/ipos', (req, res) => {
    console.log(req.query.s, req.query.e);
    apiFetcher.getIpos().then(ipos => {
        let sorted = ipos.sort((a, b) => {
            /*
            * U could get the filed date
            * And rank all the ones with no date set by their filed date
            */
            let aUndefined = false;
            let bUndefined = false;
            //TODO this is gonna be replaced by hasDateSet (i.e. simpler)
            if (a.date.isDateSet == false || a.date.value == undefined) {
                aUndefined = true;
                //console.log(`${a.date} is undefined`);
            }
            if (b.date.isDateSet == false || b.date.value == undefined) {
                bUndefined = true;
                //console.log(`${b.date} is undefined`);
            }

            if (aUndefined && !bUndefined) {
                return 1;
            } else if (bUndefined && !aUndefined) {
                return -1;
            } else {
                let aDate, bDate;
                if (aUndefined && bUndefined) {
                    aDate = new Date(a.filings[0].date);
                    bDate = new Date(b.filings[0].date);
                } else {
                    aDate = new Date(a.date.value);
                    bDate = new Date(b.date.value);
                }
                return aDate < bDate ? 1 : aDate.getTime() == bDate.getTime() ? a.id < b.id ? 1: -1 : -1;
            }
        })
        //console.log(sorted.map(s => `${s.date}:${s.filings[0][2]}`));
        let page = sorted.slice(req.query.s, req.query.e);
        let end = req.query.e >= sorted.length;
        res.json({"ipos": page, isEnd: end});
    });
});

app.get('/status', (req, res) => {
    res.json(status);
});

app.get('/tags', (req, res) => {
    const ip = req.clientIp;
    statTracker.logIp(ip);
    res.json(tags);
});

app.get('/stats', (req, res) => {
    res.json({
        ipoCount: overviewStats.ipoCount,
        tagCounts: overviewStats.tagCounts
    });
});

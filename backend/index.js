const express = require('express');
const axios = require('axios');
const app = express();
const tagprocessing = require('./tag-processing.js');
const dataUtils = require('./data-utils.js');

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

//TODO find a way to not write duplicate data.
//apiFetcher.loadDailyDataToDb();

const port = 5000;
app.listen(port);

app.get('/ipos', (req, res) => {
    apiFetcher.getIpos().then(ipos => res.json({"ipos": ipos}));
})

app.get('/status', (req, res) => {
    res.json(status);
})

app.get('/tags', (req, res) => {
    res.json(tags);
})
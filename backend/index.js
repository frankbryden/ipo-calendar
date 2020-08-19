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

//Tagging object
let myTagger = new tagprocessing.TagProcessing(tags);
let apiFetcher = new dataUtils.IpoApiFetcher(myTagger);

//TODO find a way to not write duplicate data.
// apiFetcher.loadDailyDataToDb();

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
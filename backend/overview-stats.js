const dataUtils = require('./data-utils.js');

class OverviewStatsGen {
    constructor() {
        this.setIpos = this.setIpos.bind(this);
        this.statsDbHandle = new dataUtils.DbAccess(dataUtils.dbUrl, dataUtils.overviewStatsDbName);
        this.statsDbHandle.initDb();
        this.ipoDbHandle = new dataUtils.DbAccess(dataUtils.dbUrl, dataUtils.dbName);
        this.dataFunction = new dataUtils.IpoApiFetcher();
        this.ipoDbHandle.initDb();
        this.ipos = [];
        this.ipoCount = -1;
        this.tagCounts = {};
        this.marketcapData = [];
    }

    updateStats() {
        //Refresh stored IPOs
        this.refreshIpos();
    }

    refreshIpos() {
        //Refresh IPOs. Completion will trigger recalculation of stats
        this.ipoDbHandle.readData("{}").then(ipos => this.setIpos(ipos));
    }

    setIpos(ipos){
        this.ipos = ipos;
        this.computeIpoCounts();
        this.computeTagCounts();
        this.computeMarketcap();
    }

    computeIpoCounts() {
        this.ipoCount = this.ipos.length;
    }

    computeTagCounts() {
        this.tagCounts = {};
        for (let ipo of this.ipos) {
            for (let tag of ipo.tags) {
                if (this.tagCounts.hasOwnProperty(tag.name)) {
                    this.tagCounts[tag.name] += 1;
                } else {
                    this.tagCounts[tag.name] = 1;
                }
            }      
        }
    }

    computeMarketcap() {
        let marketcapSum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let ipo of this.ipos) {
            let status = this.dataFunction.setCorrectStatus(ipo.ipoOverview.poOverview.DealStatus.value, ipo.ipoDate);
            let sharesOutstanding = parseInt(ipo.ipoOverview.poOverview.SharesOutstanding.value.replace(/,/g, ""), 10);
            if (status === "Priced" && !isNaN(sharesOutstanding)) {
                let date = new Date(ipo.ipoDate.value);
                let month = date.getMonth() + 1;
                let sharePrice = parseInt(ipo.ipoOverview.poOverview.ProposedSharePrice.value.substr(1, ipo.ipoOverview.poOverview.ProposedSharePrice.value.length).replace(",", ""), 10);
                marketcapSum[month] += (sharePrice * sharesOutstanding);
            }
        }
        this.marketcapData = marketcapSum;
    }
}

module.exports = {
    OverviewStatsGen
}
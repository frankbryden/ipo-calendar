const dataUtils = require('./data-utils.js');

class OverviewStatsGen {
    constructor() {
        this.setIpos = this.setIpos.bind(this);
        this.statsDbHandle = new dataUtils.DbAccess(dataUtils.dbUrl, dataUtils.overviewStatsDbName);
        this.statsDbHandle.initDb();
        this.ipoDbHandle = new dataUtils.DbAccess(dataUtils.dbUrl, dataUtils.dbName);
        this.ipoDbHandle.initDb();
        this.ipos = [];
        this.ipoCount = -1;
        this.tagCounts = {};
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
}

module.exports = {
    OverviewStatsGen
}
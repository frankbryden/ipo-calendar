class Ipo {
    constructor (ipoData) {
        this.name = ipoData.name;
        this.marketCap = ipoData.marketcap;
        this.description = ipoData.description;
        this.tags = ipoData.tags;
        this.status = ipoData.status;
        this.date = ipoData.date;
        this.id = ipoData.id;
        this.url = ipoData.url;
        this.ticker = ipoData.ticker;
        this.ceo = ipoData.ceo;
        this.revenue = ipoData.revenue;
        this.income = ipoData.income;
        this.stockholdersEquity = ipoData.stockholdersEquity;
        this.filings = ipoData.filings;
        this.exchange = ipoData.exchange;
    }
}

export default Ipo;
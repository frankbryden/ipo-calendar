class Ipo {
    constructor (ipoData) {
        this.name = ipoData.name;
        this.marketCap = ipoData.marketcap;
        this.description = ipoData.description;
        this.tags = ipoData.tags;
        this.status = ipoData.status;
        this.date = ipoData.date;
    }
}

export default Ipo;
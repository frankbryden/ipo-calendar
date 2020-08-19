class Ipo {
    constructor (ipoData) {
        this.name = ipoData.name;
        this.marketCap = ipoData.marketcap;
        this.description = ipoData.description;
        this.tags = ipoData.tags;
        this.status = ipoData.status;
        this.date = ipoData.date;
        this.id = ipoData.id;
    }
}

export default Ipo;
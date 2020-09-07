class DataFetcher {
    constructor () {
        this.iposFetched = 0;
    }

    async fetchIpos(count) {
        const js = await this.fetchData(`ipos?s=${this.iposFetched}&e=${this.iposFetched+count}`);
        this.iposFetched += count;
        return js;
    }

    async fetchStatusOpts() {
        const js = await this.fetchData("status");
        return js;
    }

    async fetchTags() {
        const js = await this.fetchData("tags");
        return js;
    }

    async fetchStats() {
        const js = await this.fetchData("stats");
        return js;
    }

    async fetchData(resource) {
        //const resp = await fetch(`http://8.9.4.228:5000/${resource}`);
        const resp = await fetch(`http://192.168.1.24:5000/${resource}`);
        let js = resp.json();
        return js;
    }
}

export default DataFetcher;

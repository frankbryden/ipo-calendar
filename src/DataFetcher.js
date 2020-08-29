class DataFetcher {
    constructor () {

    }

    async fetchIpos() {
        const js = await this.fetchData("ipos");
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
        const resp = await fetch(`/${resource}`);
        let js = resp.json();
        return js;
    }
}

export default DataFetcher;
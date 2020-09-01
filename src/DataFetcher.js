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
        //const resp = await fetch(`http://8.9.4.228:5000/${resource}`);
        const resp = await fetch(`http://localhost:5000/${resource}`);
        let js = resp.json();
        return js;
    }
}

export default DataFetcher;

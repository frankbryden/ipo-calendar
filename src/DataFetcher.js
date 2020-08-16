class DataFetcher {
    constructor () {

    }

    async fetchIpos() {
        const js = await await this.fetchData("ipos");
        return js;
    }

    async fetchStatusOpts() {
        const js = await await this.fetchData("status");
        return js;
    }

    async fetchTags() {
        const js = await await this.fetchData("tags");
        return js;
    }

    async fetchData(resource) {
        const resp = await fetch(`/${resource}`);
        let js = resp.json();
        return js;
    }
}

export default DataFetcher;
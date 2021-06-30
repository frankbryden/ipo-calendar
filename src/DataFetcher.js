class DataFetcher {
    constructor () {
        this.iposFetched = 0;
    }

    async fetchIpos(count, query, ids, tags) {
        let queryStr = query ? `&q=${query}` : "";
        let idsStr = ids ? ids.map(id => `&id=${id}`).join("") : "";
        let tagsStr = tags ? tags.map(tag => `&tag=${tag}`).join("") : "";
        let countStr = count > -1 ? `s=${this.iposFetched}&e=${this.iposFetched+count}` : "";
        const js = await this.fetchData(`ipos?${countStr}${queryStr}${idsStr}${tagsStr}`);
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
        const resp = await fetch(`http://192.168.1.156:5000/${resource}`);
        let js = resp.json();
        return js;
    }
}

export default DataFetcher;

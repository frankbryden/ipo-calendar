class IpoFetcher {
    constructor () {

    }

    async fetchIpos() {
        //const resp = await fetch("http://localhost:5000/ipos")
        const resp = await fetch("/ipos");
        let js = resp.json();
        return js;
    }
}

export default IpoFetcher;
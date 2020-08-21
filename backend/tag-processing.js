class TagProcessing {
    constructor(tags) {
        this.tags = tags;
    }

    determineTags(data) {
        data = data.toLowerCase();
        // let words = data.split(" ");
        let tagsInData = [];
        for (let tag of this.tags) {
            for (let kw of tag.keywords){
                let res = data.search(kw);
                console.log(res);
                if (data.search(kw)){
                    tagsInData.push(tag);
                    break;
                }
            }
        }
        return tagsInData;
    }
}

module.exports = {
    TagProcessing
}
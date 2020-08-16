class TagProcessing {
    constructor(tags) {
        this.tags = tags;
    }

    determineTags(data) {
        data = data.toLowerCase();
        let words = data.split(" ");
        let tagsInData = [];
        for (let tag of this.tags) {
            for (let kw of tag.keywords){
                if (words.includes(kw)){
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
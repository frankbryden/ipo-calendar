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
                if (data.search(kw) > 0){
                    tagsInData.push({
                        name: tag.name,
                        color: tag.color
                    });
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
const dns = require("dns");

class Node {

    constructor() {

        this.peers = [];

    }

    ingestHeader() {
        // todo: run consensus checks, add headers to some kind of local storage
    }    

}

module.exports = Node;
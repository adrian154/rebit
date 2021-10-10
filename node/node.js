const Blockchain = require("./blockchain.js");
const dns = require("dns");

class Node {

    constructor() {

        this.peers = [];
        this.chain = new Blockchain();

    }

    ingestHeaders(headers) {
        // basic consensus checks: version, PoW, timestamp
    }

}

module.exports = Node;
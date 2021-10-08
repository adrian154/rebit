const Blockchain = require("./blockchain.js");
const dns = require("dns");

class Node {

    constructor() {

        this.peers = [];
        this.chain = new Blockchain();

    }

    ingestHeaders(headers) {

    }

}

module.exports = Node;
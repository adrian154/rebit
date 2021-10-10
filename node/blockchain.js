// Abstract all data storage tasks in case the project moves to another database one day

const DataStore = require("./datastore.js");

class Blockchain extends DataStore {

    constructor() {
        super("blockchain.db", "blockchain-schema.sql");
    }

    storeHeader(header, hash, height) {
        this.prepare("INSERT INTO headers (version, prevHash, merkleRoot, timestamp, targetBits, nonce, hash, height, cumulativeWork)")
    }

}

module.exports = Blockchain;
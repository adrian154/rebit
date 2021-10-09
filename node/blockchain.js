// Abstract all data storage tasks in case the project moves to another database one day

const DataStore = require("./datastore.js");

class Blockchain extends DataStore {

    constructor() {
        super("blockchain.db", "blockchain-schema.sql");
    }

}

b = new Blockchain();

module.exports = Blockchain;
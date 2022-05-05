// Abstract all data storage tasks in case the project moves to another database one day

// deps
const Database = require("better-sqlite3");
const pow = require("./pow.js");

// constants
const SCHEMA = require("fs").readFileSync(__dirname + "/blockchain-schema.sql", {encoding: "utf-8"});

class Blockchain {

    constructor() {

        this.db = new Database("data/blockchain.db");
        this.db.exec(SCHEMA);
    
        // prepare some statements
        this.getPrevWorkStmt = this.db.prepare("SELECT cumulativeWork FROM headers WHERE hash = ?").pluck();
        this.selectStmt = this.db.prepare("SELECT * FROM headers WHERE hash = ?");
        this.insertStmt = this.db.prepare("INSERT INTO headers (version, prevHash, merkleRoot, timestamp, targetBits, nonce, hash, height, cumulativeWork) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    }

    storeHeader(header, hash, height) {
        const work = this.getPrevWorkStmt(hash) + pow.calculateWork(header);
        this.insertStmt.run(header.version, header.prevHash, header.merkleRoot, header.timestamp, header.targetBits, header.nonce, hash, height, work);
    }

    getHeader(hash) {
        return this.selectStmt.run(hash);
    }

}

b = new Blockchain();

module.exports = Blockchain;
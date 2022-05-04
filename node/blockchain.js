// block tree handling class
const Database = require("better-sqlite3");
const Table = require("./table.js");
const pow = require("./pow.js");
const fs = require("fs");

class Blockchain extends Table {

    constructor() {

        const db = new Database("data/blockchain.db");
        
        this.headers = new Table(db, "headers", [

            // metadata fields
            "hash BLOB PRIMARY KEY",
            "height INTEGER NOT NULL",
            "cumulativeWork INTEGER NOT NULL",
            
            // header fields
            "version INTEGER NOT NULL",
            "prevHash BLOB NOT NULL",
            "merkleRoot BLOB NOT NULL",
            "timestamp INTEGER NOT NULL",
            "targetBits INTEGER NOT NULL",
            "nonce INTEGER NOT NULL"
        ]);

    }

    getHeader(hash) {
        return this.selectQuery.get(hash);
    }

    ingestHeader(header) {
        
        // TODO: check difficulty
        // TODO: check timestamp 

        const hash = pow.checkPOW(header);
        const previous = this.getHeader(header.prevHash);
        if(!previous) {
            throw new Error("Refusing to insert orphan header (referring");
        }

        // TODO: transaction, update chaintips if necessary

        this.insertQuery({
            
            // header fields
            version: header.version,
            prevHash: header.prevHash,
            merkleRoot: header.merkleRoot,
            timestamp: header.timestamp,
            targetBits: header.targetBits,
            nonce: header.nonce,

            // metadata fields
            hash,
            height: previous.height + 1,
            cumulativeWork: previous.cumulativeWork + pow.calculateWork(header)   

        });

    }

}

module.exports = Blockchain;
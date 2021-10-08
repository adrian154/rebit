// Base class for data-storing things

const Database = require("better-sqlite3");
const fs = require("fs");

class DataStore {

    constructor(dbname, schemafile) {
        this.db = new Database(`data/${dbname}`);
        this.db.exec(fs.readFileSync(`node/${schemafile}`, {encoding: "utf8"}));
        this.queries = {};
    }

    prepare(query) {
        return this.queries[query] ?? (this.queries[query] = this.db.prepare(query));
    }

}

module.exports = DataStore;
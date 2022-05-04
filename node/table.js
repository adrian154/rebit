// small sqlite helper
module.exports = class {

    constructor(db, name, columns) {
        this.db = db;
        this.db.exec(`CREATE TABLE IF NOT EXISTS ${name} (${columns.join(",")})`);
        this.name = name;
    }

    select(options) {
        return this.db.prepare(`SELECT ${options.columns.join(",")} FROM ${this.name} WHERE ${options.where || "1"} ${options.order ? `ORDER BY ${options.order}` : ""} ${options.limit ? `LIMIT ${options.limit}` : ""}`);
    }

    update(options) {  
        return this.db.prepare(`UPDATE OR ${options.fallback || "ABORT"} ${this.name} SET ${Object.keys(options.columns).map(col => `${col}=${options.columns[col]}`).join(", ")} WHERE ${options.where || "1"}`);
    }

    insert(options) {
        return this.db.prepare(`INSERT OR ${options.fallback || "ABORT"} INTO ${this.name} (${Object.keys(options.columns).join(", ")}) VALUES (${Object.values(options.columns).join(", ")})`);
    }

    delete(where) {
        return this.db.prepare(`DELETE FROM ${this.name} WHERE ${where}`);
    }

    toFunction(stmt, all) {
        return (...params) => stmt.reader ? (all ? stmt.all(...params) : stmt.get(...params)) : stmt.run(...params);
    }

};
const crypto = require("crypto");

module.exports = {
    sha256: data => crypto.createHash("sha256").update(data).digest()
};
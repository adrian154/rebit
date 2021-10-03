const crypto = require("crypto");
const util = require("util");

const sha256 = data => crypto.createHash("sha256").update(data).digest();
const randomBytes = util.promisify(crypto.randomBytes);

const randomUInt64 = async () => {
    const bytes = await randomBytes(8);
    return bytes.readBigUInt64LE();
};

module.exports = {sha256, randomBytes, randomUInt64};
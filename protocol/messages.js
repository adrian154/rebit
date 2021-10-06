// All messages
const empty = {
    serialize: () => Buffer.alloc(0),
    deserialize: () => {}
};

module.exports = {
    version: require("./version.js"),
    verack: empty,
    sendheaders: empty,
    sendcmpct: require("./sendcmpct.js"),
    ping: require("./pingpong.js"),
    pong: require("./pingpong.js"),
    getheaders: require("./getheaders-getblocks.js"),
    getblocks: require("./getheaders-getblocks.js"),
    feefilter: require("./feefilter.js"),
    inv: require("./inv.js"),
    addr: require("./addr.js")
};
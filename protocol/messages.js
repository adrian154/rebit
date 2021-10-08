// All messages
const empty = {
    serialize: () => Buffer.alloc(0),
    deserialize: () => {}
};

module.exports = {
    verack: empty,
    getaddr: empty,
    sendheaders: empty,
    addr: require("./addr.js"),
    ping: require("./pingpong.js"),
    pong: require("./pingpong.js"),
    headers: require("./headers.js"),
    version: require("./version.js"),
    feefilter: require("./feefilter.js"),
    sendcmpct: require("./sendcmpct.js"),
    inv: require("./inv-getdata-notfound.js"),
    getdata: require("./inv-getdata-notfound.js"),
    notfound: require("./inv-getdata-notfound.js"),
    getblocks: require("./getheaders-getblocks.js"),
    getheaders: require("./getheaders-getblocks.js"),
};
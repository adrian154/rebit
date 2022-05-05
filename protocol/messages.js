// All messages
const empty = {
    serialize: () => Buffer.alloc(0),
    deserialize: () => {}
};

module.exports = {
    verack: empty,
    getaddr: empty,
    sendheaders: empty,
    addr: require("./types/addr.js"),
    ping: require("./types/ping-pong.js"),
    pong: require("./types/ping-pong.js"),
    headers: require("./types/headers.js"),
    version: require("./types/version.js"),
    feefilter: require("./types/feefilter.js"),
    sendcmpct: require("./types/sendcmpct.js"),
    inv: require("./types/inv-getdata-notfound.js"),
    getdata: require("./types/inv-getdata-notfound.js"),
    notfound: require("./types/inv-getdata-notfound.js"),
    getblocks: require("./types/getheaders-getblocks.js"),
    getheaders: require("./types/getheaders-getblocks.js"),
};
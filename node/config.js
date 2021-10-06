// node configuration constants
module.exports = {
    
    // how often to send ping messages (seconds)
    PING_INTERVAL: 120,

    // how long to wait for a peer to acknowledge a version message
    AWAIT_VERACK_TIME: 10,

    // identity info
    USER_AGENT: "Rebit",
    PROTOCOL_VERSION: 70011,
    SERVICES: {},

    // DNS seeds, co-opted from bitcoin core (chainparams.cpp:121)
    DNS_SEEDS: [
        "seed.bitcoin.sipa.be",
        "dnsseed.bluematt.me",
        "dnsseed.bitcoin.dashjr.org",
        "seed.bitcoinstats.com",
        "seed.bitcion.jonasschnelli.ch",
        "seed.btc.petertodd.org",
        "seed.bitcoin.sprovoost.nl",
        "dnsseed.emzy.de",
        "seed.bitcoin.wiz.biz"
    ]

};
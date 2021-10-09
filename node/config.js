// node configuration constants
// one day, this should probably be split into different files (JSON for configs, JS for consensus-critical things)
module.exports = {
    
    // how often to send ping messages (seconds)
    PING_INTERVAL: 120,

    // how long to wait for a peer to acknowledge a version message
    AWAIT_VERACK_TIME: 10,

    // identity info
    USER_AGENT: "/Rebit-0.0.1/",
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
    ],

    GENSIS_BLOCK_HASH: Buffer.from([0x6f, 0xe2, 0x8c, 0x0a, 0xb6, 0xf1, 0xb3, 0x72, 0xc1, 0xa6, 0xa2, 0x46, 0xae, 0x63, 0xf7, 0x4f, 0x93, 0x1e, 0x83, 0x65, 0xe1, 0x5a, 0x08, 0x9c, 0x68, 0xd6, 0x19, 0x00, 0x00, 0x00, 0x00, 0x00])

};
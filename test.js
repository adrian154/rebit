const Peer = require("./node/peer.js");
const dns = require("dns");

dns.resolve4("seed.bitcoin.sipa.be", (err, addresses) => {
    
    if(err) throw err;
    
    // pick a random address
    const addr = addresses[Math.floor(Math.random() * addresses.length)];

    // connect
    const peer = new Peer(null, {ip: addr});

});
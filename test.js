const dns = require("dns");
const Peer = require("./node/peer.js");

dns.resolve("seed.bitcoin.sipa.be", "A", (err, addresses) => {
    const ip = addresses[Math.floor(Math.random() * addresses.length)];
    console.log("Trying " + ip);
    const peer = new Peer({ip});
});
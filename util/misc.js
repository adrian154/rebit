// random functions that don't belong elsewhere
module.exports = {
    parseipv4: addr => Buffer.from(addr.split(".").map(Number)),
    ipv6: ipv4 => Buffer.concat([Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff]), ipv4]),
    printHex: buffer => console.log([...buffer].map(x => x.toString(16).padStart(2, '0')).join(" "))
};
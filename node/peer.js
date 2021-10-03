const SocketWrapper = require("../util/socket-wrapper.js");
const Connection = require("../protocol/connection.js");
const {randomUInt64} = require("../util/crypto.js");
const Version = require("../protocol/version.js");
const {ipToString} = require("../util/misc.js");
const misc = require("../util/misc.js");
const net = require("net");

// Store peer state, handle events
class Peer {

    constructor(options) {

        // socket shouldn't be directly accessed after connection
        // so it's not stored as an object property
        const socket = new net.Socket();
        this.connection = new Connection(new SocketWrapper(socket));

        if(options?.addr) {
            socket.connect(8333, ipToString(options.addr.ip));
        } else if(options?.ip) {
            socket.connect(8333, options.ip);
        } else {
            throw new Error("What do you think you're doing?"); // FIXME
        }

        this.connection.on("ready", async () => {
            
            this.connection.send({
                command: "version",
                payload: Version.serialize({
                    version: 70015,
                    servicesBig: 1n,
                    timestampBig: BigInt(Math.floor(Date.now() / 1000)),
                    receiverAddr: options.addr || {
                        servicesBig: 1n,
                        ip: misc.ipv6(misc.parseipv4(options.ip)), // TODO: IPv6 support
                        port: 8333
                    },
                    senderAddr: { // send some bogus - this part is redundant
                        servicesBig: 0n,
                        ip: Buffer.alloc(16),
                        port: 0
                    },
                    nonceBig: await randomUInt64(),
                    userAgent: "Rebit",
                    startHeight: 0,
                    relay: false
                })
            });

        });

        this.connection.on("version", message => {
            console.log(message);
            this.version = message.version;
            this.connection.send({
                command: "verack",
                payload: Buffer.alloc(0)
            });
        });

        this.connection.on("verack", message => {
            this.versionAcknowledged = true;
        });

    }

}

module.exports = Peer;
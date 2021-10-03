const SocketWrapper = require("../util/socket-wrapper.js");
const Connection = require("../protocol/connection.js");
const {randomUInt64} = require("../util/crypto.js");
const PingPong = require("../protocol/pingpong.js");
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
            
            this.versionNonce = await randomUInt64();

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
                    nonceBig: this.versionNonce,
                    userAgent: "Rebit",
                    startHeight: 0,
                    relay: false
                })
            });

        });

        this.connection.on("version", message => {
            
            // don't connect to self
            if(this.versionNonce === message.nonceBig) {
                this.connection.close();
                return;
            }

            console.log(`Connected to peer (running ${message.userAgent})`);

            this.version = message.version;
            this.connection.send({
                command: "verack",
                payload: Buffer.alloc(0)
            });

        });

        this.connection.on("verack", message => {
            this.versionAcknowledged = true;
        });

        this.connection.on("ping", message => {
            if(this.versionAcknowledged) {
                this.connection.send({
                    command: "pong",
                    payload: PingPong.serialize({
                        nonce: message.nonce
                    })
                })
            }
        });

        this.connection.on("sendheaders", message => {
            if(this.versionAcknowledged) {
                this.canSendHeaders = true; // this message indicates that headers can be sent via `headers` instead of `inv`
            }
        });

        this.connection.on("sendcmpct", message => {
            // TODO
        });

        this.connection.on("getheaders", message => {
            // TODO
        });

    }

}

module.exports = Peer;
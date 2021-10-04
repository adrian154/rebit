const SocketWrapper = require("../util/socket-wrapper.js");
const Connection = require("../protocol/connection.js");
const {randomUInt64} = require("../util/crypto.js");
const PingPong = require("../protocol/pingpong.js");
const Version = require("../protocol/version.js");
const {ipToString} = require("../util/misc.js");
const {PING_INTERVAL, AWAIT_VERACK_TIME} = require("./config.js");
const misc = require("../util/misc.js");
const net = require("net");
const { INVENTORY_TYPES } = require("../protocol/inventory-vector.js");

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

        // add all the important logic
        this.setupMessageHandlers();
        this.startPingInterval();

        // send version
        this.connection.on("ready", async () => {
            
            this.versionNonce = await randomUInt64();

            this.connection.send({
                command: "version",
                payload: Version.serialize({
                    version: 70011,
                    services: {network: 0}, // TODO: stop hardcoding services
                    timestamp: Math.floor(Date.now() / 1000),
                    receiverAddr: options.addr || {
                        services: {network: 1},
                        ip: misc.ipv6(misc.parseipv4(options.ip)), // TODO: IPv6 support
                        port: 8333
                    },
                    senderAddr: { // send some bogus - this part is redundant
                        services: {},
                        ip: Buffer.alloc(16),
                        port: 0
                    },
                    nonce: this.versionNonce,
                    userAgent: "Rebit",
                    startHeight: 0,
                    relay: false
                })
            });

        });

        // drop the connection 
        setTimeout(() => {
            if(!this.versionAcknowledged) {
                console.log("Waiting period for VERACK has passed, disconnecting...");
                this.close();
            }
        }, AWAIT_VERACK_TIME * 1000);

    }

    startPingInterval() {
        this.pingInterval = setInterval(async () => {
            if(this.versionAcknowledged) {
                this.connection.send({
                    command: "ping",
                    payload: PingPong.serialize({
                        nonce: await randomUInt64()
                    })
                });
            }
        }, PING_INTERVAL * 1000);
    }

    close() {
        clearInterval(this.pingInterval);
        this.connection.close();
    }

    setupMessageHandlers() {

        this.connection.on("version", message => {
            
            // don't connect to self
            if(this.versionNonce === message.nonce) {
                this.close();
                return;
            }

            console.log(`Connected to peer (running ${message.userAgent}) services=${Object.keys(message.services).filter(service => message.services[service]).join(" ")}`);

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

        this.connection.on("feefilter", message => {
            // TODO
        });

        this.connection.on("inv", message => {
            const types = {
                [INVENTORY_TYPES.MSG_TX]: "transaction",
                [INVENTORY_TYPES.MSG_BLOCK]: "block",
                [INVENTORY_TYPES.MSG_FILTERED_BLOCK] : "block",
                [INVENTORY_TYPES.MSG_CMPCT_BLOCK]: "block",
                [INVENTORY_TYPES.MSG_WITNESS_TX]: "transaction_with_witness",
                [INVENTORY_TYPES.MSG_WITNESS_BLOCK]: "block_with_witness",
                [INVENTORY_TYPES.MSG_FILTERED_WITNESS_BLOCK]: "block_with_witness"
            };
            for(const item of message.inventory) {
                console.log(`type=${types[item.type] ?? "unknown"} hash=${item.hash.toString("hex")}`);
            }
        });

        this.connection.on("addr", message => {
            // TODO
        });

    }

}

module.exports = Peer;
const InventoryVector = require("../protocol/inventory-vector.js");
const SocketWrapper = require("../util/socket-wrapper.js");
const Connection = require("../protocol/connection.js");
const {randomUInt64} = require("../util/crypto.js");
const Services = require("../protocol/services.js");
const Address = require("../protocol/address.js");
const {ipToString} = require("../util/misc.js");
const misc = require("../util/misc.js");
const config = require("./config.js");
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

        // add all the important logic
        this.setupMessageHandlers();
        this.startPingInterval();

        // send version
        this.connection.on("ready", async () => {
            
            this.versionNonce = await randomUInt64();

            this.connection.send({
                command: "version",
                payload: {
                    version: config.PROTOCOL_VERSION,
                    services: config.SERVICES,
                    timestamp: Math.floor(Date.now() / 1000),
                    receiverAddr: options.addr || {
                        services: {network: 1},
                        ip: misc.ipv6(misc.parseipv4(options.ip)), // TODO: IPv6 support
                        port: 8333
                    },
                    senderAddr: {services: {}, ip: Buffer.alloc(16), port: 0},
                    nonce: this.versionNonce,
                    userAgent: config.USER_AGENT,
                    startHeight: 0,
                    relay: true
                }
            });

        });

        // drop the connection 
        setTimeout(() => {
            if(!this.versionAcknowledged) {
                console.log("Waiting period for VERACK has passed, giving up on this peer...");
                this.close();
            }
        }, config.AWAIT_VERACK_TIME * 1000);

    }

    startPingInterval() {
        this.pingInterval = setInterval(async () => {
            if(this.versionAcknowledged) {
                this.connection.send({
                    command: "ping",
                    payload: {
                        nonce: await randomUInt64()
                    }
                });
            }
        }, config.PING_INTERVAL * 1000);
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

            console.log(`Connected to peer running ${message.userAgent}, services=${Services.stringify(message.services)}`);

            this.version = message.version;
            this.connection.send({
                command: "verack"
            });

        });

        this.connection.on("verack", message => {
            this.versionAcknowledged = true;
        });

        this.connection.on("ping", message => {
            if(this.versionAcknowledged) {
                this.connection.send({
                    command: "pong",
                    payload: {
                        nonce: message.nonce
                    }
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
            for(const item of message.inventory) {
                console.log(InventoryVector.stringify(item));
            }
            this.connection.send({
                command: "getdata",
                payload: {inventory: [message.inventory[0]]}
            });
        });

        this.connection.on("addr", message => {
            for(const peer of message.addresses) {
                console.log(Address.stringify(peer));
            }
        });

    }

}

module.exports = Peer;
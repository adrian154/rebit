const InventoryVector = require("../protocol/inventory-vector.js");
const SocketWrapper = require("../util/socket-wrapper.js");
const Connection = require("../protocol/connection.js");
const {randomUInt64} = require("../util/crypto.js");
const Services = require("../protocol/services.js");
const Address = require("../protocol/address.js");
const {ipToString} = require("../util/misc.js");
const {EventEmitter} = require("events");
const misc = require("../util/misc.js");
const config = require("./config.js");
const net = require("net");

// Store peer state, handle messages
class Peer extends EventEmitter {

    constructor(options) {

        super();

        // allow passing in a socket object for inbound connections
        if(options.socket) {
            this.connection = new Connection(new SocketWrapper(socket));
        } else if(options.addr || options.ip) {
            this.outbound = true; // mark outbound peers - they are more trusted
            const socket = new net.Socket();
            this.connection = new Connection(new SocketWrapper(socket));
            socket.connect(8333, options.ip || ipToString(options.addr.ip));
        } else {
            throw new Error("No connection info was given");
        }

        // add all the important logic
        this.setupMessageHandlers();
        this.startPingInterval();

        // send version
        this.connection.on("close", () => {
            this.emit("close");
        });

        this.connection.on("ready", async () => {
            
            this.versionNonce = await randomUInt64();
            
            const receiverAddr = {
                services: {network: 1},
                ip: Buffer.alloc(16), // let's see if anyone cares
                port: 8333
            };

            // dummy data (this is redundant anyways)
            const senderAddr = {services: {}, ip: Buffer.alloc(16), port: 0};

            this.connection.send("version", {
                version: config.PROTOCOL_VERSION,
                services: config.SERVICES,
                timestamp: Math.floor(Date.now() / 1000),
                receiverAddr: receiverAddr,
                senderAddr: senderAddr,
                nonce: this.versionNonce,
                userAgent: config.USER_AGENT,
                startHeight: 0,
                relay: true
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
                this.connection.send("ping", {nonce: await randomUInt64()});
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
            this.connection.send("verack");

        });

        this.connection.on("verack", () => {
            this.versionAcknowledged = true;
            
        });

        this.connection.on("ping", message => {
            if(this.versionAcknowledged) {
                this.connection.send("pong", {nonce: message.nonce});
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
        });

        this.connection.on("addr", message => {
            for(const peer of message.addresses) {
                console.log(Address.stringify(peer));
            }
        });

    }

}

module.exports = Peer;
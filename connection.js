const SocketWrapper = require("./util/socket-wrapper.js");
const {sha256} = require("./util/crypto.js");

// magic number (chainparams.cpp:102)
const MAINNET_MAGIC = Buffer.from([0xF9, 0xBE, 0xB4, 0xD9]);

class Connection {

    // this project should've really been written in TypeScript
    constructor(socketWrapper) {
        this.socket = socketWrapper;
    }

    // is this a cursed pattern? I think so
    messageLoop() {

        while(true) {
            
            const magic = await this.socket.read(4);
            if(Buffer.compare(magic, MAINNET_MAGIC) !== 0) {
                throw new Error("Invalid magic");
            }

            // commands must be padded with zeroes only (protocol.cpp:107)
            const command = await this.socket.read(12);
            for(let i = 1; i < command.length; i++) {
                if(command[i - 1] == 0 && command[i] != 0) {
                    throw new Error("Invalid command (non-zero padding)");
                }
            }

            const payloadLength = await this.socket.read(4).readUInt32LE();
            const payloadChecksum = await this.socket.read(4);
            const payload = await this.socket.read(payloadLength);

            // verify payload integrity
            if(Buffer.compare(payloadChecksum, sha256(payload).slice(0, 4)) !== 0) {
                throw new Error("Message payload and checksum don't match");
            }

            // deserialize payload
            // TODO

        }

    }

}

module.exports = Connection;
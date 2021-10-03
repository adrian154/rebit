const {BufferBuilder} = require("../util/buffer-util.js");
const {sha256} = require("../util/crypto.js");

// magic number (chainparams.cpp:102)
const MAINNET_MAGIC = Buffer.from([0xF9, 0xBE, 0xB4, 0xD9]);
const TESTNET_MAGIC = Buffer.from([0xFA, 0xBF, 0xB5, 0xDA]);

// map commands -> deserializers
const DESERIALIZERS = {
    
};

class Connection {

    // this project should've really been written in TypeScript
    constructor(socketWrapper) {
        this.socket = socketWrapper;
        this.startMessageLoop();
    }

    // serialize network message
    send(message) {
        
        const builder = new BufferBuilder();
        const commandBuf = Buffer.alloc(12).fill(message.command, 0, message.command.length);
        const checksum = sha256(sha256(message.payload));

        builder.putBuffer(MAINNET_MAGIC);
        builder.putBuffer(commandBuf);
        builder.putUInt32LE(message.payload.length);
        builder.putBuffer(checksum.slice(0, 4));
        builder.putBuffer(message.payload);

        this.socket.write(builder.build());

    }

    // is this a cursed pattern? I think so
    async startMessageLoop() {

        await this.socket.ready();
        
        while(true) {
            
            const magic = await this.socket.read(4);
            if(Buffer.compare(magic, MAINNET_MAGIC) !== 0) {
                throw new Error("Invalid magic");
            }

            // commands must be padded with zeroes only (protocol.cpp:107)
            const commandBuf = await this.socket.read(12);
            for(let i = 1; i < commandBuf.length; i++) {
                if(commandBuf[i - 1] == 0 && commandBuf[i] != 0) {
                    throw new Error("Invalid command (non-zero padding)");
                }
            }

            // TODO: figure out reference client's behavior when all 12 command bytes are nonzero
            const command = commandBuf.slice(0, commandBuf.indexOf(0)).toString("utf-8");

            // read payload
            const payloadLength = (await this.socket.read(4)).readUInt32LE();
            const payloadChecksum = await this.socket.read(4);
            const payload = await this.socket.read(payloadLength);

            // verify payload integrity
            if(Buffer.compare(payloadChecksum, sha256(sha256(payload)).slice(0, 4)) !== 0) {
                throw new Error("Message payload and checksum don't match");
            }

            if(!DESERIALIZERS[command]) {
                throw new Error(`Can't deserialize unknown command "${command}"`);
            }

            const message = DESERIALIZERS[command](payload);

            // TODO: do something with this message

        }

    }

}

module.exports = Connection;
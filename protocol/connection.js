const {EventEmitter} = require("events");
const {BufferBuilder} = require("../util/buffer-util.js");
const {sha256} = require("../util/crypto.js");
const {COMMAND_NAME_LENGTH, MAINNET_MAGIC} = require("./constants.js");

// map commands -> deserializers
const DESERIALIZERS = {
    version: require("./version.js").deserialize,
    verack: () => {} 
};

// Abstract away message handling and deserialization
class Connection extends EventEmitter {

    constructor(socketWrapper, options) {
        super();
        this.magic = options?.magic || MAINNET_MAGIC;
        this.socket = socketWrapper;
        this.socket.ready().then(() => {
            this.startMessageLoop();
            this.emit("ready");
        });
    }

    // serialize network message
    // TODO: figure out if payload serialization belongs here
    send(message) {
        
        const builder = new BufferBuilder();
        const commandBuf = Buffer.alloc(COMMAND_NAME_LENGTH).fill(message.command, 0, message.command.length);
        const checksum = sha256(sha256(message.payload));

        builder.putBuffer(this.magic);
        builder.putBuffer(commandBuf);
        builder.putUInt32LE(message.payload.length);
        builder.putBuffer(checksum.slice(0, 4));
        builder.putBuffer(message.payload);

        this.socket.write(builder.build());

    }

    // cursed pattern
    async startMessageLoop() {
        
        while(true) {
            
            const magic = await this.socket.read(4);
            if(Buffer.compare(magic, this.magic) !== 0) {
                throw new Error("Invalid magic");
            }

            // commands must be padded with zeroes only (protocol.cpp:107)
            const commandBuf = await this.socket.read(COMMAND_NAME_LENGTH);
            for(let i = 1; i < commandBuf.length; i++) {
                if(commandBuf[i - 1] == 0 && commandBuf[i] != 0) {
                    throw new Error("Invalid command (non-zero padding)");
                }
            }

            // TODO: figure out reference client's behavior when all command bytes are nonzero
            // for now, bad things will happen!
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

            // emit event
            this.emit(command, DESERIALIZERS[command](payload, this.version));

        }

    }

}

module.exports = Connection;
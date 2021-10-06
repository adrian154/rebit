const {COMMAND_NAME_LENGTH, MAINNET_MAGIC, MAX_MESSAGE_SIZE} = require("./constants.js");
const {BufferBuilder} = require("../util/buffer-util.js");
const {sha256} = require("../util/crypto.js");
const Messages = require("./messages.js");
const {EventEmitter} = require("events");
const { printHex } = require("../util/misc.js");

// obsolete messages to ignore
const IgnoredMessages = ["alert", "checkorder", "submitorder", "reply"];

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

    close() {
        this.socket.close();
        this.emit("close");
    }

    // serialize network message
    // TODO: figure out if payload serialization belongs here
    send(message) {
        
        let payload;
        if(message.buffer) {
            payload = message.buffer;
        } else {
            payload = Messages[message.command].serialize(message.payload);
        }

        const builder = new BufferBuilder();
        const commandBuf = Buffer.alloc(COMMAND_NAME_LENGTH).fill(message.command, 0, message.command.length);
        const checksum = sha256(sha256(payload));

        builder.putBuffer(this.magic);
        builder.putBuffer(commandBuf);
        builder.putUInt32LE(payload.length);
        builder.putBuffer(checksum.slice(0, 4));
        builder.putBuffer(payload);

        console.log("tx: " + message.command);
        this.socket.write(builder.build());
        console.log(printHex(builder.build()));

    }

    // cursed pattern
    async startMessageLoop() {
    
        try {
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
                if(payloadLength > MAX_MESSAGE_SIZE) {
                    throw new Error("Received a message that exceeded maximum size");
                }

                const payloadChecksum = await this.socket.read(4);
                const payload = await this.socket.read(payloadLength);

                // verify payload integrity
                if(Buffer.compare(payloadChecksum, sha256(sha256(payload)).slice(0, 4)) !== 0) {
                    throw new Error("Message payload and checksum don't match");
                }

                if(IgnoredMessages.includes(command)) {
                    console.log(`willingly ignoring "${command}" message`);
                    console.log(printHex(payload));
                    continue;
                }

                if(!Messages[command]) {
                    throw new Error(`Can't deserialize unknown command "${command}"`);
                }

                // emit event
                // TODO: handle failed deserialization
                const message = Messages[command].deserialize(payload, this.version);
                console.log("rx: " + command);
                this.emit(command, message);

            }
        } catch(error) {
            this.close();
        }

    }

}

module.exports = Connection;
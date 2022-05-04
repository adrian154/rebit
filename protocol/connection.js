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
    send(command, payload) {
        
        const body = Buffer.isBuffer(payload) ? payload : Messages[command].serialize(payload);

        const builder = new BufferBuilder();
        const commandBuf = Buffer.alloc(COMMAND_NAME_LENGTH).fill(command, 0, command.length);
        const checksum = sha256(sha256(body));

        builder.putBuffer(this.magic);
        builder.putBuffer(commandBuf);
        builder.putUInt32LE(body.length);
        builder.putBuffer(checksum.slice(0, 4));
        builder.putBuffer(body);

        console.log("tx: " + command);
        this.socket.write(builder.build());

    }

    async receiveMessage() {

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

        return {command, payload};
        
    }

    async startMessageLoop() {
    
        try {
            while(true) {
        
                const message = await this.receiveMessage();

                if(IgnoredMessages.includes(message.command)) {
                    console.log(`willingly ignoring "${message.command}" message`);
                    continue;
                }

                if(!Messages[message.command]) {
                    throw new Error(`Can't deserialize unknown command "${message.command}"`);
                }

                // emit event
                // TODO: handle failed deserialization
                const payload = Messages[message.command].deserialize(message.payload, this.version);
                console.log("rx: " + message.command);
                this.emit(message.command, payload);

            }
        } catch(error) {
            console.error(error);
            this.close();
        }

    }

}

module.exports = Connection;
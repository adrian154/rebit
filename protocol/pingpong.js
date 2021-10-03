// Same methods used for both ping and pong messages since they are identical
// Assume protocol version >= 60001 (nonce field/pong added)
const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = (ping) => {
    const builder = new BufferBuilder();
    builder.putUInt64LE(ping.nonce);
    return builder.build();
};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    return {
        nonce: reader.readUInt64LE()
    };

};

module.exports = {serialize, deserialize};
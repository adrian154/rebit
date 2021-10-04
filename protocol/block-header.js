const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = (block) => {

    const builder = new BufferBuilder();
    
    builder.putInt32LE(block.version);
    builder.putBuffer(block.prevBlockHash);
    builder.putBuffer(block.merkleRoot);
    builder.putUInt32LE(block.timestamp);
    builder.putUInt32LE(block.targetBits);
    builder.putUInt32LE(block.nonce);

    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    
    return {
        version: reader.readInt32LE(),
        prevBlockHash: reader.readBuffer(32),
        merkleRoot: reader.readBuffer(32),
        timestamp: reader.readUInt32LE(),
        targetBits: reader.readUInt32LE(),
        nonce: reader.readUInt32LE()
    };

};

module.exports = {serialize, deserialize};
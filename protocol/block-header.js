const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = (block) => {

    const builder = new BufferBuilder();
    
    builder.putInt32LE(block.version);
    builder.putBuffer(block.prevBlockHash);
    builder.putBuffer(block.merkleRoot);
    builder.putUint32LE(block.timestamp);
    builder.putUint32LE(block.targetBits);
    builder.putUint32LE(block.nonce);

    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    
    return {
        version: reader.readInt32LE(),
        prevBlockHash: reader.readBuffer(32),
        merkleRoot: reader.readBuffer(32),
        timestamp: reader.readUint32LE(),
        targetBits: reader.readUint32LE(),
        nonce: reader.readUint32LE()
    };

};

module.exports = {serialize, deserialize};
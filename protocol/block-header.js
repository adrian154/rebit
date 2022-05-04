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
        prevBlockHash: reader.readBuffer(32).reverse().toString("hex"),
        merkleRoot: reader.readBuffer(32),
        timestamp: new Date(reader.readUInt32LE()*1000),
        targetBits: reader.readUInt32LE(),
        nonce: reader.readUInt32LE()
    };

};

module.exports = {serialize, deserialize};
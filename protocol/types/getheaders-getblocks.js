const {BufferBuilder, BufferReader} = require("../../util/buffer-util.js");

const serialize = (getheaders) => {

    const builder = new BufferBuilder();
    
    builder.putUInt32LE(getheaders.version);
    builder.putVarInt(getheaders.hashes.length);
    for(const hash of getheaders.hashes){ 
        builder.putBuffer(hash);
    }

    builder.putBuffer(getheaders.stopHash);
    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    const result = {};

    result.version = reader.readUInt32LE();
    result.hashes = [];

    const count = reader.readVarInt();
    for(let i = 0; i < count; i++) {
        result.hashes.push(reader.readBuffer(32));
    }

    result.stopHash = reader.readBuffer(32);

    return result;

};

module.exports = {serialize, deserialize};
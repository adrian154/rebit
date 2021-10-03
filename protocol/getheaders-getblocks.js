const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = (getheaders) => {

    const builder = new BufferBuilder();
    builder.putUInt32LE(getheaders.version);
    builder.putVarInt(getheaders.blockLocatorHashes.length);
    for(const hash of getheaders.blockLocatorHashes.length){ 
        builder.putBuffer(hash);
    }
    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    const result = {};

    result.version = reader.readUInt32LE();
    result.blockLocatorHashes = [];

    // always at least one hash (hash_stop)
    for(let i = 0; i < reader.readVarInt() + 1; i++) {
        result.blockLocatorHashes.push(reader.readBuffer(32));
    }

    return result;

};

module.exports = {serialize, deserialize};
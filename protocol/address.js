// assume version >= 31402 (time field present in address, except in version message)
const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = (address) => {

    const builder = new BufferBuilder();

    if(address.time) builder.putUInt32LE(address.time);
    builder.putUInt64LE(address.servicesBig);
    builder.putBuffer(address.ip);
    builder.putUInt16BE(address.port);

    return builder.build();

};

// Network addresses sent in the version message lack the time field
const deserialize = (obj, isVersionMessage) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    const result = {};

    if(!isVersionMessage) result.time = reader.readUInt32LE();
    result.servicesBig = reader.readUInt64LE();
    result.ip = reader.readBuffer(16);
    result.port = reader.readUInt16BE();

    return result;

};

module.exports = {serialize, deserialize};
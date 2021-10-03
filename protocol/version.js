const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = () => {

};

const deserialize = (buffer) => {

    const reader = new BufferReader(buffer);
    const version = reader.readInt32LE();
    
    const servicesHi = reader.readUInt32LE();
    const servicesLo = reader.readUInt32LE();

    // TODO: 64-bit integer handling
    // currently timestamp handling assumes that...
    // * the timestamp is never negative
    // * the timestamp is < 2^32
    const timestampHi = reader.readUInt32LE();
    const timestampLo = reader.readUInt32LE(); 

};

module.exports = {serialize, deserialize};
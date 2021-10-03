const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = () => {

};

// Network addresses sent in the version message lack the time field
const deserialize = (buffer, isVersion) => {

    const reader = new BufferReader(buffer);
    
    const time = isVersion && reader.readUInt32LE();
    const servicesHi = reader.readUInt32LE();
    const servicesLo = reader.readUInt32LE();
    

};

module.exports = {serialize, deserialize};
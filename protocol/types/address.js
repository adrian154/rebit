// Serialize/deserialize the network address type

const {BufferBuilder, BufferReader} = require("../../util/buffer-util.js");
const {ipToString} = require("../../util/misc.js");
const Services = require("./services.js");

const serialize = (address) => {

    const builder = new BufferBuilder();

    if(address.time) builder.putUInt32LE(address.time);
    builder.putUInt64LE(Services.encode(address.services));
    builder.putBuffer(address.ip);
    builder.putUInt16BE(address.port);

    return builder.build();

};

// Network addresses sent in the version message lack the time field
const deserialize = (obj, isVersionMessage) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    const result = {};

    if(!isVersionMessage) result.time = reader.readUInt32LE();
    result.services = Services.decode(reader.readUInt64LE());
    result.ip = reader.readBuffer(16);
    result.port = reader.readUInt16BE();

    return result;

};

const stringify = (address) => `ip=${ipToString(address.ip)} services=${Services.stringify(address.services)} port=${address.port}`;

module.exports = {serialize, deserialize, stringify};
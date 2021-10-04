// assume protocol version >= 209 (starting height field exists)
const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");
const {MAX_USER_AGENT_LENGTH} = require("./constants.js");
const Services = require("./services.js");
const Address = require("./address.js");

const serialize = (version) => {

    const builder = new BufferBuilder();

    builder.putInt32LE(version.version);
    builder.putUInt64LE(Services.encode(version.services));
    builder.putUInt64LE(version.timestampBig);
    builder.putBuffer(Address.serialize(version.receiverAddr));

    builder.putBuffer(Address.serialize(version.senderAddr));
    builder.putUInt64LE(version.nonceBig);
    builder.putVarStr(version.userAgent);
    builder.putInt32LE(version.startHeight);

    if(version.version >= 70001) {
        builder.putUInt8(version.relay);
    }

    return builder.build();

};

// TODO: are these `address`es being deserialized correctly?
// what version to use for each?
const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    const result = {};

    result.version = reader.readInt32LE();
    result.services = Services.decode(reader.readUInt64LE());
    result.timestampBig = reader.readUInt64LE();
    result.receiverAddr = Address.deserialize(reader, true);

    result.senderAddr = Address.deserialize(reader, true);
    result.nonceBig = reader.readUInt64LE();
    result.userAgent = reader.readVarStr(MAX_USER_AGENT_LENGTH); 
    result.startHeight = reader.readInt32LE();

    if(result.version >= 70001) {
        result.relay = Boolean(reader.readUInt8());
    }

    return result;

};

module.exports = {serialize, deserialize};
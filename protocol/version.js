const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");
const Address = require("./address.js");

const serialize = (version) => {

    const builder = new BufferBuilder();

    builder.putInt32LE(version.version);
    builder.putUInt64LE(version.servicesBig);
    builder.putUInt64LE(version.timestampBig);
    builder.putBuffer(Address.serialize(version.receiverAddr));

    if(version.version >= 106) {
        builder.putBuffer(Address.serialize(version.senderAddr));
        builder.putUInt64LE(version.nonceBig);
        builder.putVarStr(version.userAgent);
        builder.putInt32LE(version.startHeight);
    }

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
    result.servicesBig = reader.readUInt64LE();
    result.timestampBig = reader.readUInt64LE();
    result.receiverAddr = Address.deserialize(reader, result.version, true);

    if(result.version >= 106) {
        result.senderAddr = Address.deserialize(reader, result.version, true);
        result.nonceBig = reader.readUInt64LE();
        result.userAgent = reader.readVarStr(256); // max = 256 (net.h:59)
        result.startHeight = reader.readInt32LE();
    }

    if(result.version >= 70001) {
        result.relay = Boolean(reader.readUInt8());
    }

    return result;

};

module.exports = {serialize, deserialize};
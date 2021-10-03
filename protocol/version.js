const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");
const Address = require("./address.js");

const serialize = (address) => {

    const builder = new BufferBuilder();

    builder.putInt32LE(address.version);
    builder.putUInt64LE(address.servicesBig);
    builder.putUInt64LE(address.timestampBig);
    builder.putBuffer(Address.serialize(address.receiverAddr));

    if(address.version >= 106) {
        builder.putBuffer(Address.serialize(address.senderAddr));
        builder.putUInt64LE(address.nonceBig);
        builder.putVarStr(address.userAgent);
        builder.putInt32LE(address.startHeight);
    }

    if(address.version >= 70001) {
        builder.putUInt8(address.relay);
    }

    return builder.build();

};

// TODO: are these `address`es being deserialized correctly?
// what version to use for each?
const deserialize = (buffer) => {

    const reader = new BufferReader(buffer);
    const result = {};

    result.version = reader.readInt32LE();
    result.servicesBig = reader.readUInt64LE();
    result.timestampBig = reader.readUInt64LE();
    result.receiverAddr = Address.deserialize(reader.readBuffer(16), result.version, true);

    if(version >= 106) {
        result.senderAddr = Address.deserialize(reader.readBuffer(16), result.version, true);
        result.nonceBig = reader.readUInt64LE();
        result.userAgent = reader.readVarStr(256); // max = 256 (net.h:59)
        result.startHeight = reader.readInt32LE();
    }

    if(version >= 70001) {
        result.relay = Boolean(reader.readUInt8());
    }

    return result;

};

module.exports = {serialize, deserialize};
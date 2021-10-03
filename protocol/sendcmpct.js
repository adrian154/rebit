const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = (sendcmpct) => {

    const builder = new BufferBuilder();

    builder.putUInt8(sendcmpct.enabled);
    builder.putUInt64LE(sendcmpct.versionBig);

    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    return {
        enabled: Boolean(reader.readUInt8()),
        versionBig: reader.readUInt64LE()
    };

};

module.exports = {serialize, deserialize};
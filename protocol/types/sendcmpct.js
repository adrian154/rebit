// see BIP 152
const {BufferBuilder, BufferReader} = require("../../util/buffer-util.js");

const serialize = (sendcmpct) => {

    const builder = new BufferBuilder();

    builder.putUInt8(sendcmpct.enabled);
    builder.putUInt64LE(sendcmpct.version);

    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    return {
        enabled: Boolean(reader.readUInt8()),
        version: Number(reader.readUInt64LE()) // WARNING: 64->53 cast; currently version is only 1 (or 2), so it doesn't matter
    };

};

module.exports = {serialize, deserialize};
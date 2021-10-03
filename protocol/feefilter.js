// see BIP 133
const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = (feefilter) => {

    const builder = new BufferBuilder();
    builder.putUInt64LE(feefilter.feerateBig);
    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    return {
        feerateBig: reader.readUInt64LE()
    };

};

module.exports = {serialize, deserialize};
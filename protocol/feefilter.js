// see BIP 133
const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const serialize = (feefilter) => {

    const builder = new BufferBuilder();
    builder.putUInt64LE(BigInt(feefilter.feerate)); 
    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    return {
        feerate: Number(reader.readUInt64LE()) // WARNING: 64->53 cast, if feerates exceed 2**53 sat/kb god help us all
    };

};

module.exports = {serialize, deserialize};
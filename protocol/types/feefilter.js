// see BIP 133
const {BufferBuilder, BufferReader} = require("../../util/buffer-util.js");

const serialize = (feefilter) => {

    const builder = new BufferBuilder();
    builder.putUInt64LE(BigInt(feefilter.feerate)); 
    return builder.build();

};

const deserialize = (obj) => {

    // FIXME: This code casts the feerate (64 bits) to a Number, which can only accurately represent integers up to 2**53 
    // If the feerate has exceeded 2**53 sat/kb, this code will start behaving unpredictably
    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    return {
        feerate: Number(reader.readUInt64LE()) 
    };

};

module.exports = {serialize, deserialize};
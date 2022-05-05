const {BufferBuilder, BufferReader} = require("../../util/buffer-util.js");
const BlockHeader = require("./block-header.js");

const serialize = (headers) => {

    const builder = new BufferBuilder();
    builder.putVarInt(headers.headers.length);
    for(const header of headers.headers) {
        builder.putBuffer(BlockHeader.serialize(header));
    } 

    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    const result = {headers: []};

    const count = reader.readVarInt();
    for(let i = 0; i < count; i++) {
        result.headers.push(BlockHeader.deserialize(reader));
        reader.advance(1); // unused transaction-count byte (should always be zero)
    }

    return result;

};

module.exports = {serialize, deserialize};
// For the `addr` message, not the address datastructure.
// Assume version >= 31402 (time field present)

const {BufferBuilder, BufferReader} = require("../../util/buffer-util.js");
const {MAX_ADDR_ENTRIES} = require("../constants.js");
const Address = require("./address.js");

const serialize = (addr) => {

    const builder = new BufferBuilder();
    builder.putVarInt(addr.addresses.length);
    for(const address of addr.addresses) {
        builder.putBuffer(Address.serialize(address));
    }
    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    const result = {};

    // TODO: verify whether the satoshi client actually enforces this limit on inbound `addr`s as we do here
    const count = reader.readVarInt();
    if(count > MAX_ADDR_ENTRIES) {
        throw new Error("Received too many addresses");
    }

    result.addresses = [];
    for(let i = 0; i < count; i++) {
        result.addresses.push(Address.deserialize(reader));
    }

    return result;

};

module.exports = {serialize, deserialize};
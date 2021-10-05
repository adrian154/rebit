const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");

const INVENTORY_TYPES = Object.freeze({
    ERROR: 0,
    MSG_TX: 1,
    MSG_BLOCK: 2,
    MSG_FILTERED_BLOCK: 3,
    MSG_CMPCT_BLOCK: 4,
    MSG_WITNESS_TX: 0x40000001,
    MSG_WITNESS_BLOCK: 0x40000002,
    MSG_FILTERED_WITNESS_BLOCK: 0x40000003
});

const serialize = (inventoryVector) => {

    const builder = new BufferBuilder();
    builder.putUInt32LE(inventoryVector.type);
    builder.putBuffer(inventoryVector.hash);
    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    return {
        type: reader.readUInt32LE(),
        hash: reader.readBuffer(32)
    };

};

// for use with stringify only
const TypeNames = {
    [INVENTORY_TYPES.MSG_TX]: "transaction",
    [INVENTORY_TYPES.MSG_BLOCK]: "block",
    [INVENTORY_TYPES.MSG_FILTERED_BLOCK] : "block",
    [INVENTORY_TYPES.MSG_CMPCT_BLOCK]: "block",
    [INVENTORY_TYPES.MSG_WITNESS_TX]: "transaction_with_witness",
    [INVENTORY_TYPES.MSG_WITNESS_BLOCK]: "block_with_witness",
    [INVENTORY_TYPES.MSG_FILTERED_WITNESS_BLOCK]: "block_with_witness"
};

const stringify = (inventoryVector) => `type=${TypeNames[inventoryVector.type] ?? "unknown"} hash=${inventoryVector.hash.toString("hex")}`;

module.exports = {serialize, deserialize, INVENTORY_TYPES, stringify};
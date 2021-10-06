const {BufferBuilder, BufferReader} = require("../util/buffer-util.js");
const {MAX_INVENTORY_ENTRIES} = require("./constants.js");
const InventoryVector = require("./inventory-vector");

const serialize = (inv) => {

    const builder = new BufferBuilder();
    builder.putVarInt(inv.inventory.length);
    for(const entry of inv.inventory) {
        builder.putBuffer(InventoryVector.serialize(entry));
    }

    return builder.build();

};

const deserialize = (obj) => {

    const reader = obj instanceof BufferReader ? obj : new BufferReader(obj);
    const result = {};

    const count = reader.readVarInt();
    if(count > MAX_INVENTORY_ENTRIES) {
        throw new Error("Too many inventory entries received");
    }

    result.inventory = [];
    for(let i = 0; i < count; i++) {
        result.inventory.push(InventoryVector.deserialize(reader));
    }

    return result;

};

module.exports = {serialize, deserialize};
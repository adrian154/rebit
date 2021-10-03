module.exports = {

    // chainparams.cpp:102
    MAINNET_MAGIC: Buffer.from([0xF9, 0xBE, 0xB4, 0xD9]), 
    TESTNET_MAGIC: Buffer.from([0xFA, 0xBF, 0xB5, 0xDA]), 

    // net.h:59
    MAX_USER_AGENT_LENGTH: 256,

    COMMAND_NAME_LENGTH: 12,

    // net_processing.cpp:78
    MAX_INVENTORY_ENTRIES: 50000,

    // net_processing:158
    MAX_ADDR_ENTRIES: 1000

};
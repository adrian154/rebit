// akin to chainparams.c
module.exports = {
    
    // chainparams.c:111
    GenesisBlock: {
        header: {
            version: 1,
            prevBlockHash: Buffer.alloc(32),
            merkleRoot: Buffer.from("3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a", "hex"),
            timestamp: 1231006505,
            targetBits: 0x1d00ffff,
            nonce: 2083236893
        }
    }

};
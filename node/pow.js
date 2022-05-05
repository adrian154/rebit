// If I actually cared about avoiding spurious forks, I would be using arith_uint256 instead of JS's BigInt
// ... or better yet, simply exporting consensus functionality to libbitcoinconsensus 
// But I don't, so it's okay :)

const BlockHeader = require("../protocol/block-header.js");
const {sha256} = require("../util/crypto.js");

// 2**256
const TWO_POW_256 = 2n**256n;

const compactToBigInt = (compact) => {

    // decode compact integer format (see arith_uint256.h:258)
    // reject negative ones, odds are they'll only ever be encountered from naughty peers
    if(compact & (1 << 23)) {
        throw new Error("Compact can't be negative");
    }

    const exponent = BigInt(compact >> 24); 
    const mantissa = BigInt(compact & 0x7FFFFF); // extract lower 23 bits

    if(mantissa != 0n && ((exponent > 34) || (mantissa > 0xff && exponent > 33) || (mantissa > 0xffff && exponent > 32))) {
        throw new Error("Compact overflow");
    }

    return exponent <= 3 ? mantissa >> (3n - exponent) * 8n : mantissa << (exponent - 3n) * 8n;

};

const hashToBigInt = (hash) => {
    
    let result = 0n;
    for(let i = 0; i < hash.length; i++) {
        result |= BigInt(hash[i]) << BigInt(i * 8);
    }

    return result;

};

const hashHeader = (rawHeader) => sha256(sha256(rawHeader));

// NOTE: Consensus methods indicate failure via exceptions, not returning something
// This decision was made since some methods to calculate things may return values.
module.exports = {

    hashHeader,

    // reference: pow.cpp:74
    checkPOW: (header) => {

        const raw = BlockHeader.serialize(header);
        const hash = hashHeader(raw);
        const target = compact(header.targetBits);

        if(target == 0) {
            throw new Error("Target bits cannot be zero");
        }

        if(hashToBigInt(hash) > target) {
            throw new Error("Work not proven (hash exceeds target)");
        }

        return hash;

    },

    // WARNING: THIS MIGHT SIGNIFICANTLY DEVIATE FROM SATOSHI CLIENT BEHAVIOR!
    // reference: chain.cpp:122
    calculateWork: (header) => {
        
        const target = compactToBigInt(header.targetBits);
        
        if(target == 0) {
            throw new Error("Target bits cannot be zero");
        }
        
        return TWO_POW_256 / (target + 1n);
        
    }

};
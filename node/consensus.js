// TODO: move everything once there's more consensus code
// but still keep things modular

const BlockHeader = require("../protocol/block-header.js");
const {sha256} = require("../util/crypto.js");

const compactToBigInt = (compact) => {

    // decode compact integer format (see arith_uint256.h:258)
    // reject negative ones, odds are they'll only ever be encountered from naughty peers
    if(compact & (1 << 23)) {
        throw new Error("Compact can't be negative");
    }

    const exponent = BigInt(compact >> 24); 
    const mantissa = BigInt(compact & 0x7FFFFF); // extract lower 23 bits

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

module.exports = {
    checkPOW: (header) => {
        
        // TODO: save the raw blockheader somewhere instead of re-serializing
        const raw = BlockHeader.serialize(header);
        const hash = hashHeader(raw);

        return hashToBigInt(hash) <= compactToBigInt(header.targetBits);

    } 
};
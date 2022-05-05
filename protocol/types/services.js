// For decoding services numbers
const NODE_NETWORK = 1n;
const NODE_GET_UTXO = 2n;
const NODE_BLOOM = 4n;
const NODE_WITNESS = 8n;
const NODE_COMPACT_FILTERS = 64n;
const NODE_NETWORK_LIMITED = 1024n;

const encode = (services) =>
    (services.network ? NODE_NETWORK : 0n)                |
    (services.getUTXO ? NODE_GET_UTXO : 0n)               |
    (services.bloom ? NODE_BLOOM : 0n)                    |
    (services.witness ? NODE_WITNESS : 0n)                |
    (services.compactFilters ? NODE_COMPACT_FILTERS : 0n) | 
    (services.networkLimited ? NODE_NETWORK_LIMITED : 0n);

const decode = (servicesInt) => ({
    network: Boolean(servicesInt & NODE_NETWORK),
    getUTXO: Boolean(servicesInt & NODE_GET_UTXO),
    bloom: Boolean(servicesInt & NODE_BLOOM),
    witness: Boolean(servicesInt & NODE_WITNESS),
    compactFilters: Boolean(servicesInt & NODE_COMPACT_FILTERS),
    pruned: Boolean(servicesInt & NODE_NETWORK_LIMITED)
});

const stringify = services => Object.keys(services).filter(service => services[service]).join(",");

module.exports = {encode, decode, stringify};
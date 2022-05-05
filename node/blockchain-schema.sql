/* Even seemingly useless fields are included so the full block header can be recreated from each record */
CREATE TABLE IF NOT EXISTS headers (

    /* block header fields */
    version INTEGER NOT NULL,
    prevHash BLOB NOT NULL,
    merkleRoot BLOB NOT NULL,
    timestamp INTEGER NOT NULL,
    targetBits INTEGER NOT NULL,
    nonce INTEGER NOT NULL,

    /* metadata */
    hash BLOB NOT NULL PRIMARY KEY,
    height INTEGER NOT NULL,
    cumulativeWork INTEGER NOT NULL

);

/* 'tips' of each blockchain (all chains stem from the genesis block) */
CREATE TABLE IF NOT EXISTS chainTips ( 
    hash BLOB NOT NULL,
);
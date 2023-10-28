let createIDTable  = new Array(256);

const Initialize = () => {
    for (let i = 0; i < 256; i++) {
        let x = i;
        for (let j = 0; j < 8; j++) {
            x = ((x & 1) == 1) ? (x >>> 1) ^ (0xA001 << 14) : x >>> 1;
        }
        createIDTable[i] = x;
    }
}

const CreateID = (inputString) => {
    let utf8Encode = new TextEncoder();
    let utf8Array = utf8Encode.encode(inputString.toLowerCase());

    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
        hash = (hash >> 8) ^ createIDTable[(hash & 0x000000FF) ^ utf8Array[i]];
    }

    // Special processing to come up with the finalized hashcode
    hash = ((hash >>> 24) | ((hash >> 8) & 0x0000FF00) | ((hash << 8 ) & 0x00FF0000) | (hash << 24)) >>> 0;
    hash = ((hash >>> 2) | 0x80000000) >>> 0;

    return hash;
}

Initialize();
console.log(CreateID('st01_to_st03_hole'));
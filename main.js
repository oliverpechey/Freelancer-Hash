// Imports
import ini from '@nodecraft/ini';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class FreelancerHash {
    /**
     * The constructor populates the required lookup tables when the class is instantiated.
     * @constructor
     * @param {string} directory The Freelancer DATA directory .
     */
    constructor(directory) {
        this.lookupTable = new Array(256);
        this.factionLookupTable = new Array(256);
        directory ? this.directory = directory : this.directory = path.dirname(fileURLToPath(import.meta.url));
        this.hashMap = new Map(); // This is our main data structure that will hold all the nicknames and hashes.
        
        for (let i = 0; i < 256; i++) {
            // Populate the ID Lookup tables.
            let idLookup = i;
            let factionIdLookup = i << 8 >>> 0;
            for (let j = 0; j < 8; j++) {
                idLookup = ((idLookup & 1) == 1) ? (idLookup >>> 1) ^ (0xA001 << 14) : idLookup >>> 1;
                factionIdLookup = ((factionIdLookup & 0x8000) == 0x8000) ? (factionIdLookup << 1) ^ 0x1021 : (factionIdLookup << 1);
                factionIdLookup &= 0xFFFF;
            }
            this.lookupTable[i] = idLookup;
            this.factionLookupTable[i] = factionIdLookup;
        }

        this.createHashList();
    }

    /**
     * Convert the hash to a nickname.
     * @param {number} hash
     * @returns {string} The nickname associated with that hash.
     */
    getNickname = (hash) => {
        // Map.get does strict equality so convert to number.
        if(typeof hash !== 'number') {
            hash = Number(hash);
        }
        // Just in case our type conversion failed.
        if(isNaN(hash))
            return null;

        // Find nickname in our hashmap.
        return this.hashMap.get(hash);
    }

    /**
     * Converts the nickname to a hash. Note: This re-hashes rather than looks up via the existing hashmap.
     * @param {string} nickname 
     * @returns {number} The hash associated with the nickname.
     */
    getHash = (nickname) => {
        return this.createID(nickname);
    }

    /**
     * Converts the faction nickname to a hash. Note: This re-hashes rather than looks up via the existing hashmap.
     * @param {string} nickname 
     * @returns 
     */
    getFactionHash = (nickname) => {
        return this.createFactionID(nickname);
    }
    
    /**
     * Reads the ini files, pulls out the nicknames and adds a hash of them to the hash map.
     */
    createHashList = () => {
        // Grab all the ini files
        let iniFiles = this.getIniFiles();
        // Extract all the "nickname" values and populate array
        let nicknames = [];
        let factionNicknames = [];
        // Loop over ini files, parse them and extract nicknames
        for(let file of iniFiles) {
            let parsedIni = ini.parse(fs.readFileSync(file, 'utf8'), { inlineArrays: true });
            // Faction names use "affiliation" rather than "nickname" so need to parse differently.
            if(!factionNicknames.length && file.split('\\').pop().toLowerCase() === 'faction_prop.ini') {
                factionNicknames.push(...this.extractNicknames(parsedIni, 'affiliation'));
            }
            else {
                nicknames.push(...this.extractNicknames(parsedIni));
            }
        }
        // Filter out nulls
        nicknames = nicknames.filter(n => n);
        factionNicknames = factionNicknames.filter(n => n);

        // Set Hash as key, nickname as value in map
        for(let nickname of nicknames) {
            this.hashMap.set(this.createID(nickname), nickname);
        }
        // Faction hashes use a different algorithm
        for(let nickname of factionNicknames) {
            this.hashMap.set(this.createFactionID(nickname), nickname);
        }
    }

    /**
     * Recursive function that starts in a directory and pulls out all ini files including sub-directories
     * @param {string} directory 
     * @returns {string[]} An array of file paths for all the ini files
     */
    getIniFiles = (directory = this.directory) => {
        let iniFiles = [];
        fs.readdirSync(directory).forEach(file => {
            let fullPath = path.join(directory, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                iniFiles.push(...this.getIniFiles(fullPath));
            } else if (fullPath.slice(-3) == 'ini') {
                iniFiles.push(fullPath);
            }
        });
        return iniFiles;
    }

    /**
     * Returns an array of nicknames taken from the parsed ini file.
     * @param {object} parsedIni 
     * @param {string} searchParam 
     * @returns {string[]}
     */
    extractNicknames = (parsedIni, searchParam = 'nickname') => {
        let nicknames = [];
        for(let element in parsedIni) {
            if(element === searchParam) {
                nicknames.push(...parsedIni[element]);
            }
            else {
                for(let subElement in parsedIni[element]) {
                    if(subElement === searchParam) {
                        nicknames.push(...parsedIni[element][subElement]);
                    }
                }
            }
        }
        return nicknames;
    }

    /**
     * Creates an ID hash from a specified nickname.
     * Credit goes to Sherlog for discovering the initial Freelancer hash algorithm. I have merely converted it to JS.
     * @param {string} nickname 
     * @returns {number}
     */
    createID = (nickname) => {
        if(!nickname)
            return null;
        
        const utf8Array = new TextEncoder().encode(nickname.toLowerCase());
        let hash = 0;

        for (let i = 0; i < nickname.length; i++) {
            hash = (hash >> 8) ^ this.lookupTable[(hash & 0x000000FF) ^ utf8Array[i]];
        }
    
        // Special processing to come up with the finalized hashcode
        hash = ((hash >>> 24) | ((hash >> 8) & 0x0000FF00) | ((hash << 8 ) & 0x00FF0000) | (hash << 24)) >>> 0;
        hash = ((hash >>> 2) | 0x80000000) >>> 0;
    
        return hash;
    }

    /**
     * Creates an ID hash from a specified faction nickname.
     * Credit goes to Haenlomal for discovering the initial faction Freelancer hash algorithm. I have merely converted it to JS.
     * @param {string} nickname 
     * @returns {number}
     */
    createFactionID = (nickname) => {
        if(!nickname)
            return null;

        const utf8Array = new TextEncoder().encode(nickname.toLowerCase());
        let hash = 0xFFFF;
        for(let i = 0; i < nickname.length; i++) {
            let y = (hash & 0xFF00) >>> 8;
            hash = (y ^ (this.factionLookupTable[(hash & 0x00FF) ^ utf8Array[i]])) >>> 0;
        }
        return hash;
    }
}

export default {FreelancerHash}
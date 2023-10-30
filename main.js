// Imports
import ini from '@nodecraft/ini';
import fs from 'fs';
import path from 'path';

class FreelancerHash {
    constructor(directory) {
        this.lookupTable = new Array(256);
        this.factionLookupTable = new Array(256);
        this.directory = directory;
        this.hashMap = new Map();
        
        for (let i = 0; i < 256; i++) {
            // Populate the ID Lookup tables
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
    }

    getNickname = (hash) => {
        // Map.get does strict equality so convert to number
        if(typeof hash !== 'number') {
            hash = Number(hash);
        }
        if(isNaN(hash))
            return null;

        return this.hashMap.get(hash);
    }

    getHash = (nickname) => {
        return this.createID(nickname);
    }

    getFactionHash = (nickname) => {
        return this.createFactionID(nickname);
    }
    
    createHashList = () => {
        // Grab all the ini files
        let iniFiles = this.getIniFiles();
        // Extract all the "nickname" values and populate array
        let nicknames = [];
        let factionNicknames = [];
        // Loop over ini files, parse them and extract nicknames
        for(let file of iniFiles) {
            let parsedIni = ini.parse(fs.readFileSync(file, 'utf8'), { inlineArrays: true });
            // Faction names use a different algorithm
            if(factionNicknames.length && file.toLowerCase() === (this.directory + '\\missions\\faction_prop.ini').toLowerCase()) {
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
        for(let nickname of factionNicknames) {
            this.hashMap.set(this.createFactionID(nickname), nickname);
        }
    }

    // Recursive function that starts in a directory and pulls out all ini files including sub-directories
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

    // Returns an array of nicknames taken from the parsed ini file
    extractNicknames = (array, searchParam = 'nickname') => {
        let nicknames = [];
        for(let element in array) {
            if(element === searchParam) {
                nicknames.push(...array[element]);
            }
            else {
                for(let subElement in array[element]) {
                    if(subElement === searchParam) {
                        nicknames.push(...array[element][subElement]);
                    }
                }
            }
        }
        return nicknames;
    }

    // Creates an ID hash from a specified nickname
    // Credit goes to Sherlog for discovering the initial Freelancer hash algorithm. I have merely converted it to JS.
    createID = (input) => {
        const utf8Array = new TextEncoder().encode(input.toLowerCase());
        let hash = 0;

        for (let i = 0; i < input.length; i++) {
            hash = (hash >> 8) ^ this.lookupTable[(hash & 0x000000FF) ^ utf8Array[i]];
        }
    
        // Special processing to come up with the finalized hashcode
        hash = ((hash >>> 24) | ((hash >> 8) & 0x0000FF00) | ((hash << 8 ) & 0x00FF0000) | (hash << 24)) >>> 0;
        hash = ((hash >>> 2) | 0x80000000) >>> 0;
    
        return hash;
    }

    createFactionID = (input) => {
        const utf8Array = new TextEncoder().encode(input.toLowerCase());
        let hash = 0xFFF;

        for(let i = 0; i < input.length; i++) {
            let y = (hash & 0xFF00) >>> 8;
            hash = (y ^ (this.factionLookupTable[(hash & 0x00FF) ^ input[i]])) >>> 0;
        }

        return hash;
    }
}

export default {FreelancerHash}
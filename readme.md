# Freelancer Hash
A reimplementation of Microsoft Freelancer's hashing algorithm.

## Installation
```js
npm install freelancer-hash
```

## Usage
```js
import hash from 'freelancer-hash';
let flHash = new hash.FreelancerHash('C:\\Freelancer HD Edition\\DATA');
let someNickname = flHash.getNickname(3074863431); // li_elite
```

## Note
This currently only hashes .ini files. If you need .UTF files etc. feel free to log an issue.

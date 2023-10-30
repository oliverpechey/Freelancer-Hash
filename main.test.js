import hash from './main.js';
let flHash = new hash.FreelancerHash();

describe("Ships", () => {
    test('li_elite should be 3074863431', () => {
        expect(flHash.getHash('li_elite')).toBe(3074863431);
    });

    test('li_fighter should be 2650442112', () => {
        expect(flHash.getHash('li_fighter')).toBe(2650442112);
    });

    test('ge_fighter should be 2151746432', () => {
        expect(flHash.getHash('ge_fighter')).toBe(2151746432);
    });

    test('3074863431 should be li_elite', () => {
        expect(flHash.getNickname(3074863431)).toBe('li_elite');
    });

    test('2650442112 should be li_fighter', () => {
        expect(flHash.getNickname(2650442112)).toBe('li_fighter');
    });

    test('2151746432 should be ge_fighter', () => {
        expect(flHash.getNickname(2151746432)).toBe('ge_fighter');
    });
});

describe("Factions", () => {
    test('li_n_grp should be 8778', () => {
        expect(flHash.getFactionHash('li_n_grp')).toBe(8778);
    });

    test('li_p_grp should be 33711', () => {
        expect(flHash.getFactionHash('li_p_grp')).toBe(33711);
    });

    test('rh_p_grp should be 55100', () => {
        expect(flHash.getFactionHash('rh_p_grp')).toBe(55100);
    });

    test('8778 should be li_n_grp', () => {
        expect(flHash.getNickname(8778)).toBe('li_n_grp');
    });

    test('33711 should be li_p_grp', () => {
        expect(flHash.getNickname(33711)).toBe('li_p_grp');
    });

    test('55100 should be rh_p_grp', () => {
        expect(flHash.getNickname(55100)).toBe('rh_p_grp');
    });
});

describe("Commodities", () => {
    test('commodity_gold should be 2866206539', () => {
        expect(flHash.getHash('commodity_gold')).toBe(2866206539);
    });

    test('commodity_boron should be 2810414853', () => {
        expect(flHash.getHash('commodity_boron')).toBe(2810414853);
    });

    test('commodity_silver should be 2518124616', () => {
        expect(flHash.getHash('commodity_silver')).toBe(2518124616);
    });

    test('2866206539 should be commodity_gold', () => {
        expect(flHash.getNickname(2866206539)).toBe('commodity_gold');
    });

    test('2810414853 should be commodity_boron', () => {
        expect(flHash.getNickname(2810414853)).toBe('commodity_boron');
    });

    test('2518124616 should be commodity_silver', () => {
        expect(flHash.getNickname(2518124616)).toBe('commodity_silver');
    });
});

describe("Edge cases", () => {
    test('Should be undefined', () => {
        expect(flHash.getNickname('')).toBe(undefined);
    });

    test('null into getHash should be null', () => {
        expect(flHash.getHash(null)).toBe(null);
    });

    test('undefined into getHash should be null', () => {
        expect(flHash.getHash(undefined)).toBe(null);
    });

    test('nothing into getHash should be null', () => {
        expect(flHash.getHash()).toBe(null);
    });

    test('empty string into getHash should be null', () => {
        expect(flHash.getHash('')).toBe(null);
    });

    test('null into getFactionHash should be null', () => {
        expect(flHash.getFactionHash(null)).toBe(null);
    });

    test('undefined into getFactionHash should be null', () => {
        expect(flHash.getFactionHash(undefined)).toBe(null);
    });

    test('nothing into getFactionHash should be null', () => {
        expect(flHash.getFactionHash()).toBe(null);
    });

    test('empty string into getFactionHash should be null', () => {
        expect(flHash.getFactionHash('')).toBe(null);
    });
});

export default {
    testEnvironment: 'jest-environment-node',
    transform: {}
};
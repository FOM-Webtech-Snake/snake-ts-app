import {GameSessionUtil} from "../../../src/server/util/GameSessionUtil";


describe("GameSessionUtil", () => {
    test("generateSessionId: should return a valid game session id", () => {
        const string = GameSessionUtil.generateSessionId();
        expect(/^[0-9A-Z]{6}$/.test(string)).toBe(true);
    });
});
import {DirectionUtil} from "../../../../src/client/game/util/DirectionUtil";
import {DirectionEnum} from "../../../../src/shared/constants/DirectionEnum";

describe("DirectionUtil", () => {
    test("getDirectionVector: should throw an error for invalid direction", () => {
        expect(() => DirectionUtil.getDirectionVector("INVALID" as DirectionEnum)).toThrow("Invalid direction");
    });

    test("getRotationAngle: should return correct angle for each direction", () => {
        expect(DirectionUtil.getRotationAngle(DirectionEnum.UP)).toBe(0);
        expect(DirectionUtil.getRotationAngle(DirectionEnum.DOWN)).toBe(Math.PI);
        expect(DirectionUtil.getRotationAngle(DirectionEnum.LEFT)).toBe(-Math.PI / 2);
        expect(DirectionUtil.getRotationAngle(DirectionEnum.RIGHT)).toBe(Math.PI / 2);
    });

    test("getRotationAngle: should throw an error for invalid direction", () => {
        expect(() => DirectionUtil.getRotationAngle("INVALID" as DirectionEnum)).toThrow("Invalid direction");
    });

    test("getOppositeDirection: should return the opposite direction", () => {
        expect(DirectionUtil.getOppositeDirection(DirectionEnum.UP)).toBe(DirectionEnum.DOWN);
        expect(DirectionUtil.getOppositeDirection(DirectionEnum.DOWN)).toBe(DirectionEnum.UP);
        expect(DirectionUtil.getOppositeDirection(DirectionEnum.LEFT)).toBe(DirectionEnum.RIGHT);
        expect(DirectionUtil.getOppositeDirection(DirectionEnum.RIGHT)).toBe(DirectionEnum.LEFT);
    });

    test("getOppositeDirection: should throw an error for invalid direction", () => {
        expect(() => DirectionUtil.getOppositeDirection("INVALID" as DirectionEnum)).toThrow("Invalid direction");
    });
});
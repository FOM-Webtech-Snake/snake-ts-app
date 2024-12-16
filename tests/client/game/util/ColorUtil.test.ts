import {ColorUtil, DARKEN_FACTOR, LIGHTEN_FACTOR} from "../../../../src/client/game/util/ColorUtil";


describe("ColorUtil", () => {
    test("rgbToHex: should convert #RRGGBB to 0xRRGGBB", () => {
        expect(ColorUtil.rgbToHex("#FFFFFF")).toBe(0xFFFFFF);
        expect(ColorUtil.rgbToHex("#000000")).toBe(0x000000);
        expect(ColorUtil.rgbToHex("#123456")).toBe(0x123456);
    });

    test("rgbToHex: should throw error for invalid color format", () => {
        expect(() => ColorUtil.rgbToHex("123456")).toThrow("Invalid color format. Expected #RRGGBB.");
        expect(() => ColorUtil.rgbToHex("#FFF")).toThrow("Invalid color format. Expected #RRGGBB.");
        expect(() => ColorUtil.rgbToHex("#GGGGGG")).toThrow("Invalid color format. Expected #RRGGBB.");
    });

    test("getRandomColor: should return a valid color as a hexadecimal number", () => {
        const color = ColorUtil.getRandomColor();
        expect(color).toBeGreaterThanOrEqual(0x000000);
        expect(color).toBeLessThanOrEqual(0xFFFFFF);
    });

    test("getRandomColorRGB: should return a valid color in #RRGGBB format", () => {
        const color = ColorUtil.getRandomColorRGB();
        expect(/^#[0-9A-Fa-f]{6}$/.test(color)).toBe(true);
    });

    test("lightenColor: should lighten a color by the LIGHTEN_FACTOR", () => {
        const color = 0x123456;
        const lightenedColor = ColorUtil.lightenColor(color);
        expect(lightenedColor).toBe(ColorUtil["adjustBrightness"](color, LIGHTEN_FACTOR));
    });

    test("darkenColor: should darken a color by the DARKEN_FACTOR", () => {
        const color = 0x123456;
        const darkenedColor = ColorUtil.darkenColor(color);
        expect(darkenedColor).toBe(ColorUtil["adjustBrightness"](color, DARKEN_FACTOR));
    });

    test("adjustBrightness: should adjust color brightness correctly", () => {
        const color = 0x123456;
        const brighterColor = ColorUtil["adjustBrightness"](color, 10);
        const darkerColor = ColorUtil["adjustBrightness"](color, -10);

        // Validate the brighter and darker versions
        expect(brighterColor).toBeGreaterThan(color);
        expect(darkerColor).toBeLessThan(color);

        // Ensure colors stay within bounds
        expect(ColorUtil["adjustBrightness"](0x000000, -10)).toBe(0x000000);
        expect(ColorUtil["adjustBrightness"](0xFFFFFF, 10)).toBe(0xFFFFFF);
    });
});
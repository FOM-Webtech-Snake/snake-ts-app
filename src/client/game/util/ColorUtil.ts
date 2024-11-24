export const COLOR_WHITE: number = 0xFFFFFF;
export const DARKEN_FACTOR: number = -60;
export const LIGHTEN_FACTOR: number = 5;

export class ColorUtil {

    /**
     * Converts a color from #RRGGBB format to a hexadecimal 0xRRGGBB number format.
     *
     * @param {string} color - A string representing the color in #RRGGBB format.
     * @return {number} - The color as a hexadecimal number (e.g., 0xRRGGBB).
     */
    static rgbToHex(color: string): number {
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            throw new Error("Invalid color format. Expected #RRGGBB.");
        }
        // Parse the hex string (ignoring the #) and convert to a number
        return parseInt(color.substring(1), 16);
    }

    /**
     * Generates a random color and returns it.
     *
     * @return {number} A random color represented as a hexadecimal number.
     */
    static getRandomColor(): number {
        return COLOR_WHITE & Math.floor(Math.random() * 0x1000000);
    }

    /**
     * Generates a random color and returns it.
     *
     * @return {string} A random color in #RRGGBB formatted string.
     */
    static getRandomColorRGB(): string {
        return `#${this.getRandomColor().toString(16).padStart(6, "0")}`;
    }


    /**
     * lightens a given color by a fixed factor.
     *
     * @param {number} color - The color to be lightened, represented as a numeric value.
     * @return {number} The lightened color value.
     */
    static lightenColor(color: number): number {
        return this.adjustBrightness(color, LIGHTEN_FACTOR);
    }


    /**
     * darkens a given color by a fixed factor.
     *
     * @param {number} color - The color to be darkened, represented as a numeric value.
     * @return {number} The darkened color value.
     */
    static darkenColor(color: number): number {
        return this.adjustBrightness(color, DARKEN_FACTOR);
    }

    /**
     * adjusts the brightness of a given color by a specified factor.
     *
     * @param {number} color - the original color represented as a number.
     * @param {number} factor - the factor to adjust the brightness by. Positive to increase, negative to decrease.
     * @return {number} - The color after the brightness adjustment.
     */
    private static adjustBrightness(color: number, factor: number): number {
        let r = ((color >> 16) & 0xFF) + factor;
        let g = ((color >> 8) & 0xFF) + factor;
        let b = (color & 0xFF) + factor;

        // clamp each color component to the range [0, 255]
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        // combine RGB values back into a single number
        return (r << 16) | (g << 8) | b;
    }
}

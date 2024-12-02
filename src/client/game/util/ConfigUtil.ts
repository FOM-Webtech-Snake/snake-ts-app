import Phaser from "phaser";

export class ConfigUtil {
    static createPhaserGameConfig(
        width: number,
        height: number,
        parentDiv: string): Phaser.Types.Core.GameConfig {
        return {
            title: "Snake Extreme",
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.RESIZE, // dynamic resizing
                width: width,
                height: height,
                autoCenter: Phaser.Scale.CENTER_BOTH, // center game
            },
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    fps: 60,
                    gravity: {x: 0, y: 0},
                }
            },
            backgroundColor: '#000000',
            parent: parentDiv,
            input: {
                gamepad: true,
            }
        };
    }
}
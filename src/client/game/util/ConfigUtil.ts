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
                width: width,
                height: height,
            },
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    fps: 100,
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
import Phaser from "phaser";

export class GameConfigUtil {
    static createGameConfig(width: number, height: number, parentDiv: string): Phaser.Core.Config {
        return new Phaser.Core.Config({
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
                    fps: 30,
                    gravity: {x: 0, y: 0},
                }
            },
            backgroundColor: '#000000',
            parent: parentDiv,
            input: {
                gamepad: true,
            },
        });
    }
}
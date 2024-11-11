import Phaser from "phaser";

const config = new Phaser.Core.Config({
    title: "Snake Extreme",
    type: Phaser.AUTO,
    scale: {
        width: 800,
        height: 600,
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
    parent: "game-container",
    input: {
        gamepad: true,
    },
});

export default config;
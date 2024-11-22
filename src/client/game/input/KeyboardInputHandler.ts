import {InputHandler} from "./InputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {Snake} from "../ui/Snake";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {GameScene} from "../scenes/GameScene";


export class KeyboardInputHandler extends InputHandler {
    private useWASD: boolean;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private pauseKey: Phaser.Input.Keyboard.Key;
    private startKey: Phaser.Input.Keyboard.Key;

    constructor(scene: GameScene, snake: Snake, useWASD: boolean = false) {
        super(scene, snake, InputTypeEnum.KEYBOARD);

        this.useWASD = useWASD;
        if (!this.scene.input.keyboard) {
            throw new Error("Input handler keyboard is not supported");
        }

        if (this.useWASD) {
            this.cursorKeys = this.scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }) as Phaser.Types.Input.Keyboard.CursorKeys;
        } else {
            this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
        }

        this.pauseKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.pauseKey.on('down', () => this.togglePause());

        this.startKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.startKey.on('down', () => this.startGame());
    }

    handleInput(): void {
        if (this.cursorKeys.left.isDown) {
            this.snake.setDirection(DirectionEnum.LEFT);
        } else if (this.cursorKeys.right.isDown) {
            this.snake.setDirection(DirectionEnum.RIGHT);
        } else if (this.cursorKeys.up.isDown) {
            this.snake.setDirection(DirectionEnum.UP);
        } else if (this.cursorKeys.down.isDown) {
            this.snake.setDirection(DirectionEnum.DOWN);
        }
    }
}
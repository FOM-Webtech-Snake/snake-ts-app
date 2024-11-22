import {InputHandler} from "./InputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {Snake} from "../ui/Snake";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";


// TODO needs to be tested!!!
export class GamepadInputHandler extends InputHandler {
    private gamepad: Phaser.Input.Gamepad.Gamepad;

    constructor(scene: Phaser.Scene, snake: Snake) {
        super(scene, snake, InputTypeEnum.GAMEPAD);

        if (!this.scene.input.gamepad) {
            throw new Error("Gamepad input is not supported");
        }

        this.scene.input.gamepad.once("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
            this.gamepad = pad;
        });
    }

    handleInput(): void {
        if (!this.gamepad) {
            return;
        }

        if (this.gamepad.left) {
            this.snake.setDirection(DirectionEnum.LEFT);
        } else if (this.gamepad.right) {
            this.snake.setDirection(DirectionEnum.RIGHT);
        } else if (this.gamepad.up) {
            this.snake.setDirection(DirectionEnum.UP);
        } else if (this.gamepad.down) {
            this.snake.setDirection(DirectionEnum.DOWN);
        }
    }
}

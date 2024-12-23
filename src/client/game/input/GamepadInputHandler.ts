import {InputHandler} from "./InputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {GameScene} from "../scenes/GameScene";
import {getLogger} from "../../../shared/config/LogConfig";

const log = getLogger("client.game.input.GamepadInputHandler");

export class GamepadInputHandler extends InputHandler {
    private gamepad: Phaser.Input.Gamepad.Gamepad;

    constructor(scene: GameScene, active: boolean = true) {
        super(scene, InputTypeEnum.GAMEPAD, active);

        if (!this.scene.input.gamepad) {
            throw new Error("Gamepad input is not supported");
        }

        this.scene.input.gamepad.once("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
            this.gamepad = pad;
            log.debug("gamepad connected");
        });

        this.scene.input.gamepad.on("down", (pad, button, value) => {
            log.debug(`button pressed on gamepad ${pad.id}`, button);
            log.debug("button value", value);
            this.handleButtonDown(button.index);
        })
    }

    private handleButtonDown(buttonIndex: number) {
        switch (buttonIndex) {
            case 9: // start/menu button on xbox controller
                this.togglePause();
                break;
            case 0: // a-button
                this.startGame();
        }
    }

    handleInput(): void {
        if (!this.gamepad || !this.isAssigned()) {
            log.debug("Input handler TouchInputHandler is not assigned");
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

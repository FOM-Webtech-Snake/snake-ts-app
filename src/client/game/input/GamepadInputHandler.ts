import {InputHandler} from "./InputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {PhaserSnake} from "../ui/PhaserSnake";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {GameScene} from "../scenes/GameScene";
import {getLogger} from "../../../shared/config/LogConfig";

const log = getLogger("client.game.input.GamepadInputHandler");

// TODO needs to be tested!!!
export class GamepadInputHandler extends InputHandler {
    private gamepad: Phaser.Input.Gamepad.Gamepad;

    constructor(scene: GameScene, active: boolean = true) {
        super(scene, InputTypeEnum.GAMEPAD, active);

        if (!this.scene.input.gamepad) {
            throw new Error("Gamepad input is not supported");
        }

        this.scene.input.gamepad.once("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
            this.gamepad = pad;
        });
    }

    handleInput(): void {
        if (!this.gamepad || !this.isAssigned()) {
            log.debug("Input handler TouchInputHandler is not assigned");
            return;
        }

        if (this.gamepad.A) {
            this.startGame();
        }
        if (this.gamepad.buttons[9]?.pressed) {
            this.togglePause();
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

import {InputHandler} from "./InputHandler";
import {GameScene} from "../scenes/GameScene";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {getLogger} from "../../../shared/config/LogConfig";

const log = getLogger("client.game.input.InputManager");

export class AutopilotInputHandler extends InputHandler {

    constructor(scene: GameScene, active: boolean = false) {
        super(scene, InputTypeEnum.AUTOPILOT, active);
    }

    handleInput(): void {
        if (!this.isAssigned() || !this.snake.getHeadPosition()) {
            log.debug("Input handler AutopilotInputHandler is not assigned");
            return;
        }

        const headPosition = this.snake.getHeadPosition();
        const bounds = this.scene.physics.world.bounds;

        // Determine when to change direction for circular movement
        switch (this.snake.getDirection()) {
            case DirectionEnum.RIGHT:
                if (headPosition.getX() >= bounds.width - this.snake.getHead().displayWidth) {
                    this.snake.setDirection(DirectionEnum.DOWN);
                }
                break;
            case DirectionEnum.DOWN:
                if (headPosition.getY() >= bounds.height - this.snake.getHead().displayWidth) {
                    this.snake.setDirection(DirectionEnum.LEFT);
                }
                break;
            case DirectionEnum.LEFT:
                if (headPosition.getX() <= this.snake.getHead().displayWidth) {
                    this.snake.setDirection(DirectionEnum.UP);
                }
                break;
            case DirectionEnum.UP:
                if (headPosition.getY() <= this.snake.getHead().displayWidth) {
                    this.snake.setDirection(DirectionEnum.RIGHT);
                }
                break;
        }
    }
}

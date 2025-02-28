import {InputHandler} from "./InputHandler";
import {KeyboardInputHandler} from "./KeyboardInputHandler";
import {TouchInputHandler} from "./TouchInputHandler";
import {GamepadInputHandler} from "./GamepadInputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {PhaserSnake} from "../ui/PhaserSnake";
import {GameScene} from "../scenes/GameScene";
import {getLogger} from "../../../shared/config/LogConfig";
import {AStarInputHandler} from "./AStarInputHandler";
import {CollectableManager} from "../ui/manager/CollectableManager";
import {PlayerManager} from "../ui/manager/PlayerManager";
import {ObstacleManager} from "../ui/manager/ObstacleManager";

const log = getLogger("client.game.input.InputManager");

export class InputManager {
    private handlers: Map<InputTypeEnum, InputHandler>;
    private autopilotKey: Phaser.Input.Keyboard.Key;

    constructor(scene: GameScene,
                playerManager: PlayerManager,
                collectableManager: CollectableManager,
                obstacleManager: ObstacleManager) {
        this.handlers = new Map();

        // Add input handlers
        this.handlers.set(InputTypeEnum.KEYBOARD, new KeyboardInputHandler(scene));
        this.handlers.set(InputTypeEnum.TOUCH, new TouchInputHandler(scene));
        this.handlers.set(InputTypeEnum.GAMEPAD, new GamepadInputHandler(scene));
        this.handlers.set(InputTypeEnum.AUTOPILOT, new AStarInputHandler(scene, collectableManager, obstacleManager, playerManager));

        this.autopilotKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F10);
        this.autopilotKey.on("down", () => this.toggleAutopilot());
    }

    assignToSnake(snake: PhaserSnake) {
        log.debug("assigning to snake", snake);
        this.handlers.forEach(handler => handler.assignToSnake(snake));
    }

    handleInput(): void {
        this.handlers.forEach(handler => {
            if (handler.isActive()) {
                handler.handleInput();
            }
        });
    }

    private toggleAutopilot(): void {
        const inputHandler = this.handlers.get(InputTypeEnum.AUTOPILOT);
        inputHandler.toggleActive();
    }
}

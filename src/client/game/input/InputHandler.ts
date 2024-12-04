import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {PhaserSnake} from "../ui/PhaserSnake";
import {GameScene} from "../scenes/GameScene";
import {getLogger} from "../../../shared/config/LogConfig";

const log = getLogger("client.game.input.InputHandler");

export abstract class InputHandler {
    protected scene: GameScene;
    protected snake: PhaserSnake;
    protected type: InputTypeEnum;
    protected active: boolean;

    constructor(scene: GameScene, type: InputTypeEnum, active: boolean) {
        this.scene = scene;
        this.type = type;
        this.active = active;
    }

    abstract handleInput(): void;

    togglePause(): void {
        log.debug("togglePause");
        this.scene.togglePause();
    }

    startGame(): void {
        log.debug("startGame");
        this.scene.startGame();
    }

    toggleActive(): void {
        this.active = !this.active;
        log.debug(`InputHandler ${this.type} active = ${this.active}`);
    }

    isAssigned() {
        return this.snake !== null;
    }

    isActive() {
        return this.active;
    }

    assignToSnake(snake: PhaserSnake): void {
        this.snake = snake;
    }

    unassign(): void {
        this.snake = null;
    }
}
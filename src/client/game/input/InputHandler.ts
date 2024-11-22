import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {Snake} from "../ui/Snake";
import {GameScene} from "../scenes/GameScene";
import {getLogger} from "../../../shared/config/LogConfig";

const log = getLogger("client.game.input.InputHandler");

export abstract class InputHandler {
    protected scene: GameScene;
    protected snake: Snake;
    protected type: InputTypeEnum;

    constructor(scene: GameScene, snake: Snake, type: InputTypeEnum) {
        this.scene = scene;
        this.snake = snake;
        this.type = type;
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
}
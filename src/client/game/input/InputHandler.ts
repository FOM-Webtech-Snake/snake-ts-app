import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {Snake} from "../ui/Snake";

export abstract class InputHandler {
    protected scene: Phaser.Scene;
    protected snake: Snake;
    protected type: InputTypeEnum;

    constructor(scene: Phaser.Scene, snake: Snake, type: InputTypeEnum) {
        this.scene = scene;
        this.snake = snake;
        this.type = type;
    }

    getType(): InputTypeEnum {
        return this.type;
    }

    abstract handleInput(): void;
}
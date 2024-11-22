import {InputHandler} from "./InputHandler";
import {KeyboardInputHandler} from "./KeyboardInputHandler";
import {TouchInputHandler} from "./TouchInputHandler";
import {GamepadInputHandler} from "./GamepadInputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {Snake} from "../ui/Snake";

export class InputManager {
    private handlers: Map<InputTypeEnum, InputHandler>;

    constructor(scene: Phaser.Scene, snake: Snake) {
        this.handlers = new Map();

        // Add input handlers
        this.handlers.set(InputTypeEnum.KEYBOARD, new KeyboardInputHandler(scene, snake));
        this.handlers.set(InputTypeEnum.TOUCH, new TouchInputHandler(scene, snake));
        this.handlers.set(InputTypeEnum.GAMEPAD, new GamepadInputHandler(scene, snake));
    }

    handleInput(): void {
        this.handlers.forEach(handler => handler.handleInput());
    }

    /* TODO we can use this to control more than one snake locally (later)
    getHandler(type: InputTypeEnum): InputHandler | undefined {
        return this.handlers.get(type);
    }

    addHandler(type: InputTypeEnum, handler: InputHandler): void {
        this.handlers.set(type, handler);
    }

    removeHandler(type: InputTypeEnum): void {
        this.handlers.delete(type);
    }
     */
}

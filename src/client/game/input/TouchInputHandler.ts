import {InputHandler} from "./InputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {PhaserSnake} from "../ui/PhaserSnake";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {GameScene} from "../scenes/GameScene";

const SENSITIVITY = 20;
const LONG_PRESS_THRESHOLD = 500; // ms

export class TouchInputHandler extends InputHandler {
    private startX: number;
    private startY: number;
    private longPressTimer: NodeJS.Timeout | null;

    constructor(scene: GameScene, snake: PhaserSnake) {
        super(scene, snake, InputTypeEnum.TOUCH);
        this.startX = 0;
        this.startY = 0;
        this.longPressTimer = null;

        this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.startX = pointer.x;
            this.startY = pointer.y;

            this.longPressTimer = setTimeout(() => this.togglePause(), LONG_PRESS_THRESHOLD);
        });

        this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {

            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }

            const deltaX = pointer.x - this.startX;
            const deltaY = pointer.y - this.startY;

            if (Math.abs(deltaX) < SENSITIVITY && Math.abs(deltaY) < SENSITIVITY) {
                this.startGame(); // execute startGame on a short tap
            } else if (Math.abs(deltaX) > SENSITIVITY || Math.abs(deltaY) > SENSITIVITY) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 0) {
                        this.snake.setDirection(DirectionEnum.RIGHT);
                    } else {
                        this.snake.setDirection(DirectionEnum.LEFT);
                    }
                } else {
                    if (deltaY > 0) {
                        this.snake.setDirection(DirectionEnum.DOWN);
                    } else {
                        this.snake.setDirection(DirectionEnum.UP);
                    }
                }
            }
        });
    }

    handleInput(): void {
        // Touch input is event-driven, so nothing needed here for now
    }
}

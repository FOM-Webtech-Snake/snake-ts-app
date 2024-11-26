import {InputHandler} from "./InputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {PhaserSnake} from "../ui/PhaserSnake";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {GameScene} from "../scenes/GameScene";
import {getLogger} from "../../../shared/config/LogConfig";
import {AIInputHandler} from "./AIInputHandler";
import {AutopilotInputHandler} from "./AutopilotInputHandler";

const log = getLogger("client.game.input.KeyboardInputHandler");

export class KeyboardInputHandler extends InputHandler {
    private useWASD: boolean;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private pauseKey: Phaser.Input.Keyboard.Key;
    private startKey: Phaser.Input.Keyboard.Key;
    private autopilotKey: Phaser.Input.Keyboard.Key;
    private aiKey: Phaser.Input.Keyboard.Key;
    private autopilotActive: boolean;
    private aiActive: boolean;
    private autopilotInputHandler: AutopilotInputHandler;
    private aiInputHandler: AIInputHandler;

    constructor(scene: GameScene, snake: PhaserSnake, useWASD: boolean = false) {
        super(scene, snake, InputTypeEnum.KEYBOARD);

        this.useWASD = useWASD;
        this.autopilotActive = false;
        this.aiActive = false;
        this.autopilotInputHandler = new AutopilotInputHandler(this.scene, this.snake);
        this.aiInputHandler = new AIInputHandler(this.scene, this.snake);

        if (!this.scene.input.keyboard) {
            throw new Error("Input handler keyboard is not supported");
        }

        if (this.useWASD) {
            this.cursorKeys = this.scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }) as Phaser.Types.Input.Keyboard.CursorKeys;
        } else {
            this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
        }

        this.pauseKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.pauseKey.on('down', () => this.togglePause());

        this.startKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.startKey.on('down', () => this.startGame());

        // POS1 key for toggling autopilot
        this.autopilotKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.HOME);
        this.autopilotKey.on("down", () => this.toggleAutopilot());

        this.aiKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE);
        this.aiKey.on("down", () => this.toggleAI());
    }

    handleInput(): void {
        if (this.aiActive) {
            this.aiInputHandler.handleInput();
            return;
        } else if (this.autopilotActive) {
            this.autopilotInputHandler.handleInput();
            return;
        } else {
            if (this.cursorKeys.left.isDown) {
                this.snake.setDirection(DirectionEnum.LEFT);
            } else if (this.cursorKeys.right.isDown) {
                this.snake.setDirection(DirectionEnum.RIGHT);
            } else if (this.cursorKeys.up.isDown) {
                this.snake.setDirection(DirectionEnum.UP);
            } else if (this.cursorKeys.down.isDown) {
                this.snake.setDirection(DirectionEnum.DOWN);
            }
        }
    }

    private toggleAutopilot(): void {
        this.autopilotActive = !this.autopilotActive;

        if (this.autopilotActive) {
            this.aiActive = false;
            log.info("Autopilot activated.");
        } else {
            log.info("Autopilot deactivated.");
        }
    }

    private toggleAI(): void {
        this.aiActive = !this.aiActive;
        if (this.aiActive) {
            this.autopilotActive = false;
            log.info("AI activated.");
        } else {
            log.info("AI deactivated.");
        }
    }
}
import Phaser from "phaser";
import {Background} from "../ui/Background";
import {Snake} from "../ui/Snake";
import {KeyboardInputHandler} from "../input/KeyboardInputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {InputHandler} from "../input/InputHandler";
import {ColorUtil} from "../util/ColorUtil";
import {Collectable} from "../ui/Collectable";
import {ChildCollectableTypeEnum} from "../../../shared/constants/CollectableTypeEnum";
import UUID = Phaser.Utils.String.UUID;
import {Position} from "../../../shared/model/Position";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

export class GameScene extends Phaser.Scene {

    private background: Background;
    private playerId: string;
    private snakes: Record<string, Snake>;
    private collectables: Record<string, Collectable>;

    private inputHandler: Record<InputTypeEnum, InputHandler>;


    constructor() {
        super(sceneConfig);
        this.background = null;
        this.playerId = UUID(); // create a unique playerId
        this.snakes = {} as Record<string, Snake>;
        this.collectables = {} as Record<string, Collectable>;
        this.inputHandler = {} as Record<InputTypeEnum, InputHandler>;
    }

    create() {
        // setup world & camera
        this.physics.world.setBounds(0, 0, 1600, 1200); // push the world bounds to (1600x1200px)
        this.cameras.main.setBounds(0, 0, 1600, 1200); // setup camera not to leave the world
        this.background = new Background(this);

        // game objects
        const localSnake = new Snake(this, ColorUtil.getRandomColor(), new Position(300, 300));
        this.cameras.main.startFollow(localSnake.getHead(), false, 0.1, 0.1);
        this.snakes[this.playerId] = localSnake;

        // TODO remove creation of Collectable (only for testing)
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.FOOD, {x: 100, y: 100});
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.SHRINK, {x: 100, y: 130});
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.GROWTH, {x: 100, y: 160});
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.SLOW, {x: 100, y: 190});
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.FAST, {x: 100, y: 210});
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.REVERSE, {x: 100, y: 240});
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.SPLIT, {x: 100, y: 270});
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.DOUBLE, {x: 500, y: 300});
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.DOUBLE, {x: 500, y: 400});
        this.collectables[UUID()] = new Collectable(this, ChildCollectableTypeEnum.DOUBLE, {x: 500, y: 500});

        // input handler
        const inputHandler = new KeyboardInputHandler(this, localSnake, false);
        this.inputHandler[inputHandler.getType()] = inputHandler;
    }

    update() {
        if (this.inputHandler) {
            Object.keys(this.inputHandler).forEach(handler => {
                this.inputHandler[handler].handleInput();
            })
        }

        if (this.snakes[this.playerId]) {
            this.snakes[this.playerId].update();

            if (this.collectables) {
                Object.keys(this.collectables).forEach(uuid => {
                    if (this.collectables[uuid].checkCollision(this.snakes[this.playerId])) {
                        delete this.collectables[uuid];
                    }
                });
            }

        }


    }
}
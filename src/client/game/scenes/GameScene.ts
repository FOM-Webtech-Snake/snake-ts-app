import Phaser from "phaser";
import {Background} from "../ui/Background";
import {Snake} from "../ui/Snake";
import {KeyboardInputHandler} from "../input/KeyboardInputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {InputHandler} from "../input/InputHandler";
import {ColorUtil} from "../util/ColorUtil";
import {PhaserCollectable} from "../ui/PhaserCollectable";
import {Position} from "../../../shared/model/Position";
import {GlobalPropKeyEnum} from "../constants/GlobalPropKeyEnum";
import {Socket} from "socket.io-client";
import {MultiplayerManager} from "../MultiplayerManager";
import {DEFAULT_GAME_SESSION_CONFIG, GameSessionConfig} from "../../../shared/GameSessionConfig";
import {GameSession} from "../../../shared/GameSession";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

export class GameScene extends Phaser.Scene {

    private background: Background;
    private socket: Socket;
    private config: GameSessionConfig;
    private multiplayerManager: MultiplayerManager
    private playerId: string;
    private snakes: Record<string, Snake>;
    private collectables: Record<string, PhaserCollectable>;

    private inputHandler: Record<InputTypeEnum, InputHandler>;

    constructor() {
        super(sceneConfig);
        this.background = null;
        this.socket = null;
        this.config = DEFAULT_GAME_SESSION_CONFIG;
        this.multiplayerManager = null;
        this.playerId = null;
        this.snakes = {} as Record<string, Snake>;
        this.collectables = {} as Record<string, PhaserCollectable>;
        this.inputHandler = {} as Record<InputTypeEnum, InputHandler>;
    }

    create() {
        // get necessary global properties
        this.socket = this.registry.get(GlobalPropKeyEnum.SOCKET);

        this.playerId = this.socket.id;
        this.multiplayerManager = new MultiplayerManager(this, this.socket);

        // setup world & camera
        this.physics.world.setBounds(0, 0, this.config.getWidth(), this.config.getHeight()); // push the world bounds to (e.g. 1600x1200px)
        this.cameras.main.setBounds(0, 0, this.config.getWidth(), this.config.getHeight()); // setup camera not to leave the world
        this.background = new Background(this);

        // game objects
        const localSnake = new Snake(this, this.playerId, ColorUtil.getRandomColor(), new Position(300, 300));
        this.cameras.main.startFollow(localSnake.getHead(), false, 0.1, 0.1);
        this.snakes[this.playerId] = localSnake;

        /* TODO remove creation of Collectable (only for testing)
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
        */

        // input handler
        const inputHandler = new KeyboardInputHandler(this, localSnake, false);
        this.inputHandler[inputHandler.getType()] = inputHandler;
    }

    handleGameSession(session: GameSession) {
        console.log("updating game from game session", session);
        this.setConfig(session.getConfig());
    }

    setConfig(conf: GameSessionConfig) {
        console.log("updating game config", conf);
        this.config = conf;
        this.loadGameConfig();
    }

    loadGameConfig() {
        // setup world & camera
        this.physics.world.setBounds(0, 0, this.config.getWidth(), this.config.getHeight()); // push the world bounds to (e.g. 1600x1200px)
        this.cameras.main.setBounds(0, 0, this.config.getWidth(), this.config.getHeight()); // setup camera not to leave the world

        if (this.background) {
            this.background.destroy();
        }
        this.background = new Background(this);
    }

    handleRemoteSnake(snake: string) {
        let parsedSnake = JSON.parse(snake);
        if (this.snakes[parsedSnake?.playerId]) {
            this.snakes[parsedSnake?.playerId].updateFromData(parsedSnake)
        } else {
            const newSnake = Snake.fromData(this, parsedSnake);
            this.snakes[newSnake.getPlayerId()] = newSnake;
        }
    }


    update() {
        if (this.inputHandler) {
            Object.keys(this.inputHandler).forEach(handler => {
                this.inputHandler[handler].handleInput();
            })
        }

        if (this.snakes && this.snakes[this.playerId]) {
            this.snakes[this.playerId].update();
            this.multiplayerManager.emitSnake(this.snakes[this.playerId])

            if (this.collectables) {
                Object.keys(this.collectables).forEach(uuid => {
                    if (this.collectables[uuid].checkCollision(this.snakes[this.playerId])) {
                        this.multiplayerManager.emitCollect(uuid);
                        delete this.collectables[uuid];
                    }
                });
            }
        }


    }
}
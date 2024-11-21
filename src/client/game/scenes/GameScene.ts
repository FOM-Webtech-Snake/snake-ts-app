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

    spawnCollectable(item: any) {
        const newCollectable = PhaserCollectable.fromData(this, item);
        this.collectables[newCollectable.getId()] = newCollectable;
    }

    removeCollectable(uuid: string) {
        const collectable = this.collectables[uuid];
        if (collectable) {
            collectable.destroy();
            this.collectables[uuid] = null;
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
                    // make sure the collectable is still there. it can happen, that it has been removed async by the server
                    if (this.collectables[uuid]) {
                        this.collectables[uuid].updateArrow(this.cameras.main, this.snakes[this.playerId].getHeadPosition());
                        if (this.collectables[uuid].checkCollision(this.snakes[this.playerId])) {
                            this.multiplayerManager.emitCollect(uuid, (success) => {
                                if (success) {
                                    this.collectables[uuid].applyAndDestroy(this.snakes[this.playerId]);
                                }
                                this.removeCollectable(uuid);
                            });
                        }
                    }
                });
            }
        }


    }
}
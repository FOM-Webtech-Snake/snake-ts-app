import Phaser from "phaser";
import {Background} from "../ui/Background";
import {Snake} from "../ui/Snake";
import {KeyboardInputHandler} from "../input/KeyboardInputHandler";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {InputHandler} from "../input/InputHandler";
import {ColorUtil} from "../util/ColorUtil";
import {Position} from "../../../shared/model/Position";
import {GlobalPropKeyEnum} from "../constants/GlobalPropKeyEnum";
import {Socket} from "socket.io-client";
import {MultiplayerManager} from "../MultiplayerManager";
import {DEFAULT_GAME_SESSION_CONFIG, GameSessionConfig} from "../../../shared/GameSessionConfig";
import {GameSession} from "../../../shared/GameSession";
import {ArrowManager} from "../ui/ArrowManager";
import {CollectableManager} from "../ui/CollectableManager";
import {PlayerManager} from "../ui/PlayerManager";

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
    private collectableManager: CollectableManager;
    private playerManager: PlayerManager;
    private playerId: string;

    private inputHandler: Record<InputTypeEnum, InputHandler>;

    constructor() {
        super(sceneConfig);
        this.background = null;
        this.socket = null;
        this.config = DEFAULT_GAME_SESSION_CONFIG;
        this.multiplayerManager = null;
        this.collectableManager = null;
        this.playerManager = null;
        this.playerId = null;
        this.inputHandler = {} as Record<InputTypeEnum, InputHandler>;
    }

    create() {
        // get necessary global properties
        this.socket = this.registry.get(GlobalPropKeyEnum.SOCKET);

        this.playerId = this.socket.id;

        // setup manager
        this.collectableManager = new CollectableManager(this);
        this.playerManager = new PlayerManager();
        this.multiplayerManager = new MultiplayerManager(this, this.socket, this.collectableManager, this.playerManager);

        // setup world & camera
        this.physics.world.setBounds(0, 0, this.config.getWidth(), this.config.getHeight()); // push the world bounds to (e.g. 1600x1200px)
        this.cameras.main.setBounds(0, 0, this.config.getWidth(), this.config.getHeight()); // setup camera not to leave the world
        this.background = new Background(this);

        // game objects
        const localSnake = new Snake(this, this.playerId, ColorUtil.getRandomColor(), new Position(300, 300));
        this.cameras.main.startFollow(localSnake.getHead(), false, 0.1, 0.1);
        this.playerManager.addPlayer(this.playerId, localSnake);

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
        const parsedSnake = JSON.parse(snake);
        const player = this.playerManager.getPlayer(parsedSnake?.playerId);
        if (player) {
            this.playerManager.updatePlayer(parsedSnake.playerId, parsedSnake);
        } else {
            const newSnake = Snake.fromData(this, parsedSnake);
            this.playerManager.addPlayer(parsedSnake.playerId, newSnake);
        }
    }

    update() {
        ArrowManager.getInstance().reset();

        if (this.inputHandler) {
            Object.keys(this.inputHandler).forEach(handler => {
                this.inputHandler[handler].handleInput();
            })
        }

        const player = this.playerManager.getPlayer(this.playerId);
        if (player) {
            player.update();
            this.multiplayerManager.emitSnake(player)

            this.collectableManager.update(
                player,
                this.cameras.main,
                (uuid: string) => this.multiplayerManager.handleCollectableCollision(uuid, player)
            );
        }
    }
}
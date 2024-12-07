import Phaser from "phaser";
import {Background} from "../ui/Background";
import {PhaserSnake} from "../ui/PhaserSnake";
import {GameSocketManager} from "../ui/manager/GameSocketManager";
import {DEFAULT_GAME_SESSION_CONFIG, GameSessionConfig} from "../../../shared/model/GameSessionConfig";
import {ArrowManager} from "../ui/manager/ArrowManager";
import {CollectableManager} from "../ui/manager/CollectableManager";
import {PlayerManager} from "../ui/manager/PlayerManager";
import {InputManager} from "../input/InputManager";
import {GameStateEnum} from "../../../shared/constants/GameStateEnum";
import {Overlay} from "../ui/Overlay";
import {getLogger} from "../../../shared/config/LogConfig";
import {GameSession} from "../../../shared/model/GameSession";
import {CollisionManager} from "../ui/manager/CollisionManager";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'GameScene',
};

const log = getLogger("client.game.scenes.GameScene");

export class GameScene extends Phaser.Scene {

    private state: GameStateEnum;

    private background: Background;
    private overlay: Overlay;

    private config: GameSessionConfig;
    private gameSocketManager: GameSocketManager
    private collectableManager: CollectableManager;
    private playerManager: PlayerManager;
    private collisionManager: CollisionManager;
    private inputManager: InputManager;

    constructor() {
        super(sceneConfig);

        this.background = null;
        this.overlay = null;

        this.config = DEFAULT_GAME_SESSION_CONFIG;
        this.gameSocketManager = null;
        this.collectableManager = null;
        this.playerManager = null;
        this.collisionManager = null;
        this.inputManager = null;
    }

    create() {
        // setup manager
        this.gameSocketManager = new GameSocketManager();

        this.overlay = new Overlay(this);
        this.overlay.show("loading...");

        this.collectableManager = new CollectableManager(this, this.gameSocketManager);
        this.playerManager = new PlayerManager(this, this.gameSocketManager);
        this.collisionManager = new CollisionManager(this.playerManager, this.collectableManager, this.gameSocketManager);

        this.inputManager = new InputManager(this, this.collectableManager, this.playerManager);

        // get necessary global properties
        this.registerEventListeners();
    }

    private registerEventListeners() {
        this.gameSocketManager.on("CURRENT_SESSION", (session: GameSession) => {
            this.loadGameConfig(session.getConfig());
            this.setState(session.getGameState());
        });

        this.gameSocketManager.on("SYNC_GAME_STATE", (session: GameSession) => {
            this.setState(session.getGameState());
        });

        this.gameSocketManager.on("START_GAME", () => {
            this.setState(GameStateEnum.RUNNING);
        });

        this.gameSocketManager.on("STATE_CHANGED", (state: GameStateEnum) => {
            this.setState(state);
        });

        this.gameSocketManager.on("COUNTDOWN_UPDATED", (countdown: number) => {
            if (countdown > 0) {
                this.overlay.show(`Starting in ${countdown}...`);
            } else {
                this.overlay.hide();
            }
        });
    }

    public getOverlay(): Overlay {
        return this.overlay;
    }

    public getInputManager(): InputManager {
        return this.inputManager;
    }

    cameraFollow(snake: PhaserSnake) {
        if (!snake?.getHead()) return; // follow nothing when head is not available

        this.cameras.main.startFollow(snake.getHead(), false, 0.1, 0.1);
    }

    togglePause(): void {
        log.debug("game state toggled running/pause");
        if (this.state === GameStateEnum.RUNNING) {
            this.gameSocketManager.emitGameStateChange(GameStateEnum.PAUSED);
        } else if (this.state === GameStateEnum.PAUSED) {
            this.gameSocketManager.emitGameStateChange(GameStateEnum.RUNNING);
        }
    }

    startGame(): void {
        log.debug(`game state ${this.state} - try to start`);
        if (this.state === GameStateEnum.READY) {
            this.gameSocketManager.emitGameStart();
        }
    }

    setState(state: GameStateEnum) {
        if (this.state === state) {
            log.trace("state not changed! - skipping");
            return;
        }

        log.trace("updating game state", state);
        this.state = state;

        if (this.state === GameStateEnum.RUNNING) {
            this.physics.world.resume();
            this.overlay.hide();
        } else if (this.state === GameStateEnum.READY) {
            this.physics.world.pause();
            this.overlay.showPressKeyToAction("space, tap the screen or A an a controller", "start");
        } else if (this.state === GameStateEnum.PAUSED) {
            this.physics.world.pause();
            this.overlay.showPressKeyToAction("p, long tap the screen or start on a controller", "resume");
        } else {
            this.physics.world.pause();
            this.overlay.show(`current state: ${this.state}`);
        }
    }

    getConfig(): GameSessionConfig {
        return this.config;
    }

    loadGameConfig(conf: GameSessionConfig) {
        log.debug("loading game config", conf);
        this.config = conf;
        // setup world & camera
        this.physics.world.setBounds(0, 0, this.config.getSize().getWidth(), this.config.getSize().getHeight()); // push the world bounds to (e.g. 1600x1200px)
        this.cameras.main.setBounds(0, 0, this.config.getSize().getWidth(), this.config.getSize().getHeight()); // setup camera not to leave the world

        if (this.background) {
            this.background.destroy();
        }
        this.background = new Background(this);

        if (this.overlay) {
            this.overlay.destroy();
        }
        this.overlay = new Overlay(this);
    }

    update() {
        if (this.state !== GameStateEnum.RUNNING) {
            return;
        }

        ArrowManager.getInstance().reset();
        this.inputManager?.handleInput();
        this.playerManager?.getPlayer(this.gameSocketManager.getPlayerId())?.update();
        this.playerManager?.getPlayersExcept(this.gameSocketManager.getPlayerId())?.forEach((player: PhaserSnake) => {
            player.interpolatePosition();
        })

        this.collectableManager?.update();
        this.collisionManager?.handleCollisionUpdate();
        this.gameSocketManager.emitSnake(this.playerManager?.getPlayer(this.gameSocketManager.getPlayerId()));
    }


}
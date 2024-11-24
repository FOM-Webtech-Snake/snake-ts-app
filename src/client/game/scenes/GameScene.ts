import Phaser from "phaser";
import {Background} from "../ui/Background";
import {PhaserSnake} from "../ui/PhaserSnake";
import {ColorUtil} from "../util/ColorUtil";
import {Position} from "../../../shared/model/Position";
import {GlobalPropKeyEnum} from "../constants/GlobalPropKeyEnum";
import {Socket} from "socket.io-client";
import {MultiplayerManager} from "../MultiplayerManager";
import {DEFAULT_GAME_SESSION_CONFIG, GameSessionConfig} from "../../../shared/GameSessionConfig";
import {GameSession} from "../../../shared/GameSession";
import {ArrowManager} from "../ui/manager/ArrowManager";
import {CollectableManager} from "../ui/manager/CollectableManager";
import {PlayerManager} from "../ui/manager/PlayerManager";
import {InputManager} from "../input/InputManager";
import {GameStateEnum} from "../../../shared/constants/GameStateEnum";
import {Overlay} from "../ui/Overlay";
import {getLogger} from "../../../shared/config/LogConfig";
import {Player} from "../../../shared/Player";

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

    private socket: Socket;
    private config: GameSessionConfig;
    private multiplayerManager: MultiplayerManager
    private collectableManager: CollectableManager;
    private playerManager: PlayerManager;
    private inputManager: InputManager;

    constructor() {
        super(sceneConfig);

        this.background = null;
        this.overlay = null;

        this.socket = null;
        this.config = DEFAULT_GAME_SESSION_CONFIG;
        this.multiplayerManager = null;
        this.collectableManager = null;
        this.playerManager = null;
        this.inputManager = null;
    }

    create() {
        // get necessary global properties
        this.socket = this.registry.get(GlobalPropKeyEnum.SOCKET);

        // setup manager
        this.overlay = new Overlay(this);
        this.overlay.show("loading...");

        this.collectableManager = new CollectableManager(this);
        this.playerManager = new PlayerManager();
        this.multiplayerManager = new MultiplayerManager(this, this.socket, this.collectableManager, this.playerManager);

    }

    handleGameSession(session: GameSession) {
        log.debug("updating game from game session", session);
        this.loadGameConfig(session.getConfig());
        this.initSnake(session.getPlayer(this.multiplayerManager.getPlayerId()));
        this.setState(session.getGameState());
    }

    private initSnake(player: Player) {
        // game objects
        const localSnake = new PhaserSnake(this, player.getId(), ColorUtil.rgbToHex(player.getColor()), player.getBodyPositions() ? player.getBodyPositions()[0] : new Position(300, 300));
        this.cameras.main.startFollow(localSnake.getHead(), false, 0.1, 0.1);
        this.playerManager.addPlayer(this.multiplayerManager.getPlayerId(), localSnake);

        // input manager
        this.inputManager = new InputManager(this, localSnake);
    }

    togglePause(): void {
        log.debug("game state toggled running/pause");
        if (this.state === GameStateEnum.RUNNING) {
            this.multiplayerManager.emitGameStateChange(GameStateEnum.PAUSED);
        } else if (this.state === GameStateEnum.PAUSED) {
            this.multiplayerManager.emitGameStateChange(GameStateEnum.RUNNING);
        }
    }

    startGame(): void {
        log.debug(`game state ${this.state} - try to start`);
        if (this.state === GameStateEnum.READY) {
            this.multiplayerManager.emitGameStart();
        }
    }

    setState(state: GameStateEnum) {
        log.debug("updating game state", state);
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
        this.playerManager?.getPlayer(this.multiplayerManager.getPlayerId())?.update();
        this.multiplayerManager?.syncPlayerState();
        this.multiplayerManager?.handleCollisionUpdate();
    }


}
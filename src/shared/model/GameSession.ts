import {GameStateEnum} from "../constants/GameStateEnum";
import {GameSessionConfig} from "./GameSessionConfig";
import {Player} from "./Player";
import {Collectable} from "./Collectable";
import {Server} from "socket.io";
import SpawnerDaemon from "../../server/SpawnerDaemon";
import {getLogger} from "../config/LogConfig";
import {PlayerRoleEnum} from "../constants/PlayerRoleEnum";
import {PositionUtil} from "../../server/util/PositionUtil";
import {DirectionEnum} from "../constants/DirectionEnum";

const log = getLogger("shared.GameSession");

export class GameSession {
    private id: string;
    private gameState: GameStateEnum;
    private config: GameSessionConfig;
    private players: Record<string, Player>;
    private collectables: Record<string, Collectable>;
    private remainingTime: number;
    private timerInterval: NodeJS.Timeout | null = null;


    constructor(id: string,
                config: GameSessionConfig,
                gameState: GameStateEnum = GameStateEnum.WAITING_FOR_PLAYERS,
                players: Record<string, Player> = {},
                collectables: Record<string, Collectable> = {},
                timerInterval: NodeJS.Timeout | null = null) {
        this.id = id;
        this.gameState = gameState;
        this.config = config;
        this.players = players;
        this.collectables = collectables;
        this.remainingTime = config.getGameDuration();
        this.timerInterval = timerInterval;
    }

    getId(): string {
        return this.id;
    }

    getPlayer(playerId: string | null): Player | null {
        if (playerId == null) {
            return null;
        }
        return this.players[playerId];
    }

    getPlayersAsArray(): Player[] {
        return Object.values(this.players);
    }

    getPlayerCount(): number {
        return Object.keys(this.players).length;
    }

    getGameState(): GameStateEnum {
        return this.gameState;
    }

    setGameState(state: GameStateEnum) {
        this.gameState = state;
    }

    getConfig() {
        return this.config;
    }

    getCollectables() {
        return this.collectables;
    }

    getCollectableById(id: string): Collectable | undefined {
        return this.collectables[id];
    }

    getRemainingTime() {
        return this.remainingTime;
    }

    setRemainingTime(remainingTime: number) {
        this.remainingTime = remainingTime;
    }

    getTimerInterval() {
        return this.timerInterval;
    }

    setTimerInterval(interval: NodeJS.Timeout | null) {
        this.timerInterval = interval;
    }

    setConfig(config: GameSessionConfig) {
        this.config = config;
        this.remainingTime = config.getGameDuration();
    }

    addPlayer(player: Player): void {
        this.players[player.getId()] = player;
    }

    spawnPlayers(): void {
        Object.values(this.players).forEach(player => {
            player.setDirection(DirectionEnum.RIGHT); // TODO choose random direction on spawn
            player.setSpeed(this.config.getSnakeStartingSpeed());
            player.setScale(this.config.getSnakeStartingScale())
            const bodyPositions = []
            const spawnPosition = PositionUtil.randomUniquePosition(this);
            for (let i = 0; i < this.getConfig().getSnakeStartingLength(); i++) {
                bodyPositions.push(spawnPosition);
            }
            player.setBodyPositions(bodyPositions);
        })
    }

    addCollectable(collectable: Collectable): void {
        this.collectables[collectable.getId()] = collectable;
    }

    removePlayer(playerId: string): void {
        delete this.players[playerId];
        log.trace("removedPlayer player from session", playerId);
        const playersArray = this.getPlayersAsArray();
        if (playersArray.length > 0) {
            const existingHost = playersArray.find(player => player.getRole() === PlayerRoleEnum.HOST);
            if (!existingHost) {
                // Assign HOST to the first player in the list if no HOST exists
                playersArray[0].setRole(PlayerRoleEnum.HOST);
            }
        }
    }

    removeCollectable(collectableId: string): void {
        if (this.collectables[collectableId]) {
            delete this.collectables[collectableId];
        }
    }

    hasPlayers(): boolean {
        return Object.keys(this.players).length > 0;
    }

    isWaitingForPlayers(): boolean {
        log.debug(`game session ${this.id} waiting for players`);
        return this.gameState === GameStateEnum.WAITING_FOR_PLAYERS;
    }

    start(io: Server): boolean {
        if (this.gameState === GameStateEnum.READY) {
            this.setGameState(GameStateEnum.RUNNING);

            /* initialize collectables spawner */
            const spawner = SpawnerDaemon.getInstance();
            spawner.startSpawner(this, io);
            return true;
        }

        log.warn(`Game Session ${this.id} state is not ready.`);
        return false;
    }

    toJson() {
        return {
            id: this.id,
            gameState: this.gameState,
            config: this.config.toJson(),
            players: Object.fromEntries(
                Object.entries(this.players).map(([id, player]) => [id, player.toJson()])
            ),
            collectables: Object.fromEntries(
                Object.entries(this.collectables).map(([id, collectable]) => [id, collectable.toJson()])
            ),
            remainingTime: this.remainingTime,
        };
    }

    static fromData(data: any): GameSession {
        log.debug("fromData", data);
        return new GameSession(
            data.id,
            GameSessionConfig.fromData(data.config),
            data.gameState,
            Object.fromEntries(
                Object.entries(data.players).map(([id, playerData]) => [id, Player.fromData(playerData)])
            ),
            Object.fromEntries(
                Object.entries(data.collectables).map(([id, collectableData]) => [id, Collectable.fromData(collectableData)])
            ),
            data.remainingTime
        );
    }
}
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
import {Position} from "./Position";
import {PlayerStatusEnum} from "../constants/PlayerStatusEnum";
import {Obstacle} from "./Obstacle";

const log = getLogger("shared.GameSession");

export class GameSession {
    private id: string;
    private gameState: GameStateEnum;
    private config: GameSessionConfig;
    private players: Record<string, Player>;
    private obstacles: Record<string, Obstacle>;
    private collectables: Record<string, Collectable>;
    private remainingTime: number;
    private timerInterval: NodeJS.Timeout | null = null;


    constructor(id: string,
                config: GameSessionConfig,
                gameState: GameStateEnum = GameStateEnum.WAITING_FOR_PLAYERS,
                players: Record<string, Player> = {},
                collectables: Record<string, Collectable> = {},
                obstacles: Record<string, Obstacle> = {},
                timerInterval: NodeJS.Timeout | null = null) {
        this.id = id;
        this.gameState = gameState;
        this.config = config;
        this.players = players;
        this.collectables = collectables;
        this.obstacles = obstacles;
        this.remainingTime = config.getGameDuration();
        this.timerInterval = timerInterval;
    }

    reset() {
        this.gameState = GameStateEnum.WAITING_FOR_PLAYERS;
        log.debug(`gameState changed to ${this.gameState}`);
        Object.values(this.players).forEach((player: Player) => player.reset());
        // this.spawnPlayers();
        this.collectables = {};
        this.remainingTime = this.config.getGameDuration();
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

    getPlayers(): Record<string, Player> {
        return this.players;
    }

    getPlayersAsArray(): Player[] {
        return Object.values(this.players);
    }

    getAlivePlayers(): Player[] {
        return this.getPlayersAsArray().filter(player => player.getStatus() === PlayerStatusEnum.ALIVE);
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

    getConfig(): GameSessionConfig {
        return this.config;
    }

    getCollectables(): Record<string, Collectable> {
        return this.collectables;
    }

    getCollectableById(id: string): Collectable | undefined {
        return this.collectables[id];
    }

    getObstacles(): Record<string, Obstacle> {
        return this.obstacles;
    }

    getRemainingTime() {
        return this.remainingTime;
    }

    setRemainingTime(remainingTime: number) {
        this.remainingTime = remainingTime;
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

    isHighActivity(): boolean {
        return this.gameState === GameStateEnum.RUNNING;
    }

    spawnPlayer(player: Player): void {
        player.setStatus(PlayerStatusEnum.ALIVE);
        player.setDirection(DirectionEnum.RIGHT); // TODO choose random direction on spawn
        player.setSpeed(this.config.getSnakeStartingSpeed());
        player.setScale(this.config.getSnakeStartingScale())
        const bodyPositions: Position[] = []
        const spawnPosition = PositionUtil.randomUniquePosition(this);
        for (let i = 0; i < this.getConfig().getSnakeStartingLength(); i++) {
            bodyPositions.push(spawnPosition);
        }
        player.setBodyPositions(bodyPositions);
    }

    spawnPlayers(): void {
        Object.values(this.players).forEach(player => {
            this.spawnPlayer(player);
        })
    }

    addCollectable(collectable: Collectable): void {
        this.collectables[collectable.getId()] = collectable;
    }

    addObstacle(obstacle: Obstacle): void {
        this.obstacles[obstacle.getId()] = obstacle;
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

    countPlayersWithStatus(status: PlayerStatusEnum): number {
        return Object.values(this.players).filter(player => player.getStatus() === status).length
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
            obstacles: Object.fromEntries(
                Object.entries(this.obstacles).map(([id, obstacle]) => [id, obstacle.toJson()])
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
            Object.fromEntries(
                Object.entries(data.obstacles).map(([id, obstacleData]) => [id, Obstacle.fromData(obstacleData)])
            ),
            data.remainingTime
        );
    }
}
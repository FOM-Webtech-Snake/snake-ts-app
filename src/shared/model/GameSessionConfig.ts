import {Size} from "./Size";
import {getLogger} from "../config/LogConfig";

const log = getLogger("shared.GameSessionConfig");

interface MinMaxDefault {
    min: number;
    max: number;
    default: number;
}

export const SNAKE_STARTING_LENGTH: MinMaxDefault = {min: 1, max: 30, default: 5};
export const SNAKE_STARTING_SCALE: MinMaxDefault = {min: 0.05, max: 1, default: 0.15};
export const SNAKE_STARTING_SPEED: MinMaxDefault = {min: 50, max: 300, default: 100};

export class GameSessionConfig {
    private maxPlayers: number;
    private size: Size;
    private gameDuration: number;
    private worldCollisionEnabled: boolean;
    private selfCollisionEnabled: boolean;
    private playerToPlayerCollisionEnabled: boolean;
    private respawnAfterDeathEnabled: boolean;
    private respawnTimer: number;
    private obstacleEnabled: boolean;

    private snakeStartingLength: number;
    private snakeStartingSpeed: number;
    private snakeStartingScale: number;

    constructor(
        maxPlayers: number,
        size: Size,
        gameDuration: number,
        worldCollisionEnabled: boolean,
        selfCollisionEnabled: boolean,
        playerToPlayerCollisionEnabled: boolean,
        respawnAfterDeathEnabled: boolean,
        respawnTimer: number,
        obstacleEnabled: boolean,
        snakeStartingLength: number,
        snakeStartingSpeed: number,
        snakeStartingScale: number,
    ) {
        this.maxPlayers = maxPlayers;
        this.size = size;
        this.gameDuration = gameDuration;
        this.worldCollisionEnabled = worldCollisionEnabled;
        this.selfCollisionEnabled = selfCollisionEnabled;
        this.playerToPlayerCollisionEnabled = playerToPlayerCollisionEnabled;
        this.respawnAfterDeathEnabled = respawnAfterDeathEnabled;
        this.respawnTimer = respawnTimer;
        this.obstacleEnabled = obstacleEnabled;

        this.snakeStartingLength = snakeStartingLength;
        this.snakeStartingSpeed = snakeStartingSpeed;
        this.snakeStartingScale = snakeStartingScale;
    }

    getWorldCollisionEnabled(): boolean {
        return this.worldCollisionEnabled;
    }

    getSelfCollisionEnabled(): boolean {
        return this.selfCollisionEnabled;
    }

    getPlayerToPlayerCollisionEnabled(): boolean {
        return this.playerToPlayerCollisionEnabled;
    }

    getRespawnAfterDeathEnabled(): boolean {
        return this.respawnAfterDeathEnabled;
    }

    getRespawnTimer(): number {
        return this.respawnTimer;
    }

    getObstacleEnabled(): boolean {
        return this.obstacleEnabled;
    }

    getMaxPlayers(): number {
        return this.maxPlayers;
    }

    getSize(): Size {
        return this.size;
    }

    getGameDuration(): number {
        return this.gameDuration;
    }

    getSnakeStartingLength(): number {
        return this.snakeStartingLength;
    }

    getSnakeStartingSpeed(): number {
        return this.snakeStartingSpeed;
    }

    getSnakeStartingScale(): number {
        return this.snakeStartingScale;
    }

    toJson() {
        return {
            maxPlayers: this.maxPlayers,
            size: this.size.toJSON(),
            gameDuration: this.gameDuration,
            worldCollisionEnabled: this.worldCollisionEnabled,
            selfCollisionEnabled: this.selfCollisionEnabled,
            playerToPlayerCollisionEnabled: this.playerToPlayerCollisionEnabled,
            respawnAfterDeathEnabled: this.respawnAfterDeathEnabled,
            respawnTimer: this.respawnTimer,
            obstacleEnabled: this.obstacleEnabled,
            snakeStartingLength: this.snakeStartingLength,
            snakeStartingSpeed: this.snakeStartingSpeed,
            snakeStartingScale: this.snakeStartingScale,
        };
    }

    static fromData(data: any) {
        log.debug("fromData", data);
        return new GameSessionConfig(
            data.maxPlayers,
            Size.fromData(data.size),
            data.gameDuration,
            data.worldCollisionEnabled,
            data.selfCollisionEnabled,
            data.playerToPlayerCollisionEnabled,
            data.respawnAfterDeathEnabled,
            data.respawnTimer,
            data.obstacleEnabled,
            data.snakeStartingLength,
            data.snakeStartingSpeed,
            data.snakeStartingScale);
    }
}

export const DEFAULT_GAME_SESSION_CONFIG = new GameSessionConfig(
    4,
    new Size(1600, 1600),
    300,
    true,
    false,
    true,
    true,
    10000,
    true,
    SNAKE_STARTING_LENGTH.default,
    SNAKE_STARTING_SPEED.default,
    SNAKE_STARTING_SCALE.default);
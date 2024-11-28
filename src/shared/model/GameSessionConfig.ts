import {Size} from "./Size";
import {getLogger} from "../config/LogConfig";

const log = getLogger("shared.GameSessionConfig");

export const DEFAULT_SNAKE_STARTING_LENGTH: number = 20;
export const DEFAULT_SNAKE_STARTING_SCALE: number = 0.15;
export const DEFAULT_SNAKE_STARTING_SPEED: number = 100;

export class GameSessionConfig {
    private maxPlayers: number;
    private size: Size;
    private worldCollisionEnabled: boolean;
    private selfCollisionEnabled: boolean;
    private playerToPlayerCollisionEnabled: boolean;

    private snakeStartingLength: number;
    private snakeStartingSpeed: number;
    private snakeStartingScale: number;

    constructor(
        maxPlayers: number,
        size: Size,
        worldCollisionEnabled: boolean,
        selfCollisionEnabled: boolean,
        playerToPlayerCollisionEnabled: boolean,
        snakeStartingLength: number,
        snakeStartingSpeed: number,
        snakeStartingScale: number,
    ) {
        this.maxPlayers = maxPlayers;
        this.size = size;
        this.worldCollisionEnabled = worldCollisionEnabled;
        this.selfCollisionEnabled = selfCollisionEnabled;
        this.playerToPlayerCollisionEnabled = playerToPlayerCollisionEnabled;

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

    getMaxPlayers(): number {
        return this.maxPlayers;
    }

    getSize(): Size {
        return this.size;
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
            worldCollisionEnabled: this.worldCollisionEnabled,
            selfCollisionEnabled: this.selfCollisionEnabled,
            playerToPlayerCollisionEnabled: this.playerToPlayerCollisionEnabled,
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
            data.worldCollisionEnabled,
            data.selfCollisionEnabled,
            data.playerToPlayerCollisionEnabled,
            data.snakeStartingLength,
            data.snakeStartingSpeed,
            data.snakeStartingScale);
    }
}

export const DEFAULT_GAME_SESSION_CONFIG = new GameSessionConfig(
    4,
    new Size(1600, 1600),
    true,
    false,
    true,
    DEFAULT_SNAKE_STARTING_LENGTH,
    DEFAULT_SNAKE_STARTING_SPEED,
    DEFAULT_SNAKE_STARTING_SCALE);
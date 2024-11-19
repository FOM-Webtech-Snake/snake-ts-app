import {GameStateEnum} from "./constants/GameStateEnum";
import {GameSessionUtil} from "./util/GameSessionUtil";
import {GameSessionConfig} from "./GameSessionConfig";
import {Player} from "./Player";
import {Collectable} from "./model/Collectable";

export class GameSession {
    private id: string;
    private ownerId: string;
    private gameState: GameStateEnum;
    private config: GameSessionConfig;
    private players: Record<string, Player>;
    private collectables: Record<string, Collectable>;

    constructor(id: string = null,
                ownerId: string,
                config: GameSessionConfig,
                gameState: GameStateEnum = GameStateEnum.WAITING_FOR_PLAYERS,
                players: Record<string, Player> = {},
                collectables: Record<string, Collectable> = {}) {
        this.id = id || GameSessionUtil.generateSessionId();
        this.ownerId = ownerId;
        this.gameState = gameState;
        this.config = config;
        this.players = players;
        this.collectables = collectables;
    }

    getId(): string {
        return this.id;
    }

    getOwnerId(): string {
        return this.ownerId;
    }

    getGameState(): GameStateEnum {
        return this.gameState;
    }

    getConfig() {
        return this.config;
    }

    setConfig(config: GameSessionConfig) {
        this.config = config;
    }

    addPlayer(player: Player): void {
        this.players[player.getId()] = player;
    }

    addCollectable(collectable: Collectable): void {
        this.collectables[collectable.getId()] = collectable;
    }

    removePlayer(playerId: string): void {
        delete this.players[playerId];
    }

    removeCollectable(collectableId: string): void {
        delete this.collectables[collectableId];
    }

    hasPlayers(): boolean {
        return Object.keys(this.players).length > 0;
    }

    toJson() {
        return JSON.stringify({
            id: this.id,
            ownerId: this.ownerId,
            gameState: this.gameState,
            config: this.config,
            players: this.players
        });
    }

    static fromJson(json: string): GameSession {
        const data = JSON.parse(json);
        return this.fromData(data);
    }

    static fromData(data: any): GameSession {
        return new GameSession(data.id, data.ownerId, GameSessionConfig.fromData(data.config), data.gameState, data.players);
    }
}
import {GameStateEnum} from "./constants/GameStateEnum";
import {GameSessionUtil} from "./util/GameSessionUtil";
import {GameSessionConfig} from "./GameSessionConfig";
import {Player} from "./Player";

export class GameSession {
    private id: string;
    private creatorId: string;
    private gameState: GameStateEnum;
    private config: GameSessionConfig;
    private players: Record<string, Player>;

    constructor(id: string = null,
                creatorId: string,
                config: GameSessionConfig,
                gameState: GameStateEnum = GameStateEnum.WAITING_FOR_PLAYERS,
                players: Record<string, Player> = {}) {
        this.id = id || GameSessionUtil.generateSessionId();
        this.creatorId = creatorId;
        this.gameState = gameState;
        this.config = config;
        this.players = players;
    }

    getId(): string {
        return this.id;
    }

    getCreatorId(): string {
        return this.creatorId;
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

    removePlayer(playerId: string): void {
        delete this.players[playerId];
    }

    hasPlayers(): boolean {
        return Object.keys(this.players).length > 0;
    }

    toJson() {
        return JSON.stringify({
            id: this.id,
            creatorId: this.creatorId,
            gameState: this.gameState,
            config: this.config,
            players: this.players
        });
    }

    static fromJson(json: string) {
        const data = JSON.parse(json);
        return this.fromData(data);
    }

    static fromData(data: any) {
        return new GameSession(data.id, data.creatorId, data.config, data.gameState, data.players);
    }
}
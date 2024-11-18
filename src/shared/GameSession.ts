import {GameStateEnum} from "./constants/GameStateEnum";
import {GameSessionUtil} from "./util/GameSessionUtil";

export class GameSession {
    private id: string;
    private creatorId: string;
    private gameState: GameStateEnum;
    private players: string[];

    constructor(id: string = null, creatorId: string, gameState: GameStateEnum = GameStateEnum.WAITING_FOR_PLAYERS, players: string[] = []) {
        this.id = id || GameSessionUtil.generateSessionId();
        this.creatorId = creatorId;
        this.gameState = gameState;
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

    addPlayer(playerId: string): void {
        this.players.push(playerId);
    }

    toJson() {
        return JSON.stringify({
            id: this.id,
            creatorId: this.creatorId,
            gameState: this.gameState,
            players: this.players
        });
    }

    static fromJson(json: string) {
        const data = JSON.parse(json);
        return new GameSession(data.id, data.creatorId, data.gameState, data.players);
    }
}
import {Snake} from "../Snake";
import {getLogger} from "../../../../shared/config/LogConfig";

const log = getLogger("client.game.ui.manager.PlayerManager");

export class PlayerManager {
    private players: Record<string, Snake>;

    constructor() {
        this.players = {};
    }

    addPlayer(playerId: string, snake: Snake): void {
        log.debug("add player", playerId);
        if (this.players[playerId]) {
            log.warn(`Player ${playerId} already exists.`);
            return;
        }
        this.players[playerId] = snake;
        log.debug(`Player ${playerId} added.`);
    }

    removePlayer(playerId: string): void {
        log.debug("removing player", playerId);
        const playerSnake = this.players[playerId];
        if (playerSnake) {
            playerSnake.destroy();
            delete this.players[playerId];
            log.debug(`Player ${playerId} removed.`);
        } else {
            log.warn(`Player ${playerId} does not exist.`);
        }
    }

    getPlayer(playerId: string): Snake | null {
        log.debug("getPlayer", playerId);
        return this.players[playerId] || null;
    }

    updatePlayer(playerId: string, snakeData: any): void {
        log.debug(`updatePlayer ${playerId} with ${snakeData}`);
        const playerSnake = this.players[playerId];
        if (playerSnake) {
            playerSnake.updateFromData(snakeData);
        } else {
            log.warn(`Player ${playerId} not found for update.`);
        }
    }

    getAllPlayers(): Record<string, Snake> {
        return this.players;
    }

}
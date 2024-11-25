import {PhaserSnake} from "../PhaserSnake";
import {getLogger} from "../../../../shared/config/LogConfig";

const log = getLogger("client.game.ui.manager.PlayerManager");

export class PlayerManager {
    private players: Record<string, PhaserSnake>;

    constructor() {
        this.players = {};
    }

    addPlayer(playerId: string, snake: PhaserSnake): PhaserSnake {
        log.debug("add player", playerId);
        if (this.players[playerId]) {
            log.warn(`Player ${playerId} already exists.`);
            return;
        }
        this.players[playerId] = snake;
        log.debug(`Player ${playerId} added.`);
        return this.players[playerId];
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

    getPlayer(playerId: string): PhaserSnake | null {
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

    getFirstPlayer(): PhaserSnake {
        log.debug("getting first player");

        const playerList = Object.values(this.players);
        log.trace("player list", playerList);

        if (playerList.length === 0) {
            log.warn("No players found");
            return null; // Handle case where no players exist
        }

        return playerList.reduce((highestScorer, currentPlayer) =>
            currentPlayer.getScore() > highestScorer.getScore() ? currentPlayer : highestScorer
        );
    }
}
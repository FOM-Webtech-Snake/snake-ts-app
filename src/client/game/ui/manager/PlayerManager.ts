import {PhaserSnake} from "../PhaserSnake";
import {getLogger} from "../../../../shared/config/LogConfig";
import {Position} from "../../../../shared/model/Position";

const log = getLogger("client.game.ui.manager.PlayerManager");

export class PlayerManager {
    private players: Record<string, PhaserSnake>;

    constructor() {
        this.players = {};
    }

    addSnake(snake: PhaserSnake): void {
        log.trace("adding snake", snake.toJson());
        if (this.players[snake.getPlayerId()]) {
            log.warn(`Player ${snake.getPlayerId()} already exists.`);
            return;
        }
        this.players[snake.getPlayerId()] = snake;
        log.debug(`Player ${snake.getPlayerId()} added.`);
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

    getAllPlayerPositions(): Position[] {
        return Object.values(this.players)
            .flatMap((player: PhaserSnake) => player.getBodyPositions());
    }

    getPlayer(playerId: string): PhaserSnake | null {
        log.debug("getPlayer", playerId);
        return this.players[playerId] || null;
    }

    getPlayersExcept(playerId: string): PhaserSnake[] {
        log.debug(`getPlayersExcept(${playerId})`);
        return Object.entries(this.players)
            .filter(([id, _]) => id !== playerId)
            .map(([_, player]) => player);
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
import {Snake} from "./Snake";

export class PlayerManager {
    private players: Record<string, Snake>;

    constructor() {
        this.players = {};
    }

    addPlayer(playerId: string, snake: Snake): void {
        if (this.players[playerId]) {
            console.warn(`Player ${playerId} already exists.`);
            return;
        }
        this.players[playerId] = snake;
        console.log(`Player ${playerId} added.`);
    }

    removePlayer(playerId: string): void {
        const playerSnake = this.players[playerId];
        if (playerSnake) {
            playerSnake.destroy();
            delete this.players[playerId];
            console.log(`Player ${playerId} removed.`);
        } else {
            console.warn(`Player ${playerId} does not exist.`);
        }
    }

    getPlayer(playerId: string): Snake | null {
        return this.players[playerId] || null;
    }

    updatePlayer(playerId: string, snakeData: any): void {
        const playerSnake = this.players[playerId];
        if (playerSnake) {
            playerSnake.updateFromData(snakeData);
        } else {
            console.warn(`Player ${playerId} not found for update.`);
        }
    }

    getAllPlayers(): Record<string, Snake> {
        return this.players;
    }

}
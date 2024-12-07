import {PhaserSnake} from "../PhaserSnake";
import {getLogger} from "../../../../shared/config/LogConfig";
import {Position} from "../../../../shared/model/Position";
import {GameScene} from "../../scenes/GameScene";
import {Player} from "../../../../shared/model/Player";
import {GameSocketManager} from "./GameSocketManager";
import {GameSession} from "../../../../shared/model/GameSession";

const log = getLogger("client.game.ui.manager.PlayerManager");

export class PlayerManager {
    private scene: GameScene;
    private gameSocketManager: GameSocketManager;
    private players: Record<string, PhaserSnake>;

    constructor(scene: GameScene, gameSocketManager: GameSocketManager) {
        this.scene = scene;
        this.gameSocketManager = gameSocketManager;
        this.players = {};

        this.registerEventListeners();
    }

    private initSnakes(players: Player[]) {
        if (players.length > 0) {
            players.forEach((player: Player) => {
                const snake = PhaserSnake.fromPlayer(this.scene, player);
                this.addSnake(snake);
                if (snake.getPlayerId() === this.gameSocketManager.getPlayerId()) {
                    this.scene.getInputManager().assignToSnake(snake);
                    this.scene.cameraFollow(snake);
                }
            })
        }
    }

    private updateSnakes(players: Player[]) {
        if (players.length > 0) {
            players.forEach((player: Player) => {
                const localPlayer = this.getPlayer(player.getId());
                if (localPlayer) {
                    log.trace(`player found with status: ${player.getStatus()}`);
                    if (localPlayer.getPlayerId() !== this.gameSocketManager.getPlayerId()) {
                        localPlayer.updateFromPlayer(player);
                    }
                }
            });
        }
    }

    private registerEventListeners() {
        this.gameSocketManager.on("CURRENT_SESSION", (session: GameSession) => {
            this.initSnakes(session.getPlayersAsArray());
        });

        this.gameSocketManager.on("SYNC_GAME_STATE", (session: GameSession) => {
            this.updateSnakes(session.getPlayersAsArray());
        });

        this.gameSocketManager.on("PLAYER_DIED", (playerId: string) => {
            const player = this.getPlayer(playerId);
            if (player) {
                player.die();

                if (playerId === this.gameSocketManager.getPlayerId()) {
                    this.scene.cameraFollow(this.getFirstPlayer());
                }
            }
        });

        this.gameSocketManager.on("PLAYER_RESPAWNED", (respawnedPlayer: Player) => {
            log.trace("respawning player", respawnedPlayer);
            const player = this.getPlayer(respawnedPlayer.getId());
            if (player) {
                player.revive(respawnedPlayer.getBodyPositions());
                player.updateFromPlayer(respawnedPlayer);
                if (respawnedPlayer.getId() === this.gameSocketManager.getPlayerId()) {
                    this.scene.cameraFollow(player);
                }
            }
        });

        this.gameSocketManager.on("LEFT_SESSION", (playerId: string) => {
            this.removePlayer(playerId);
        });

        this.gameSocketManager.on("DISCONNECT", (playerId: string) => {
            this.removePlayer(playerId);
        });
    }

    addSnake(snake: PhaserSnake): void {
        log.trace("adding snake", snake);
        if (this.players[snake.getPlayerId()]) {
            log.warn(`Player ${snake.getPlayerId()} already exists.`);
            return;
        }
        this.players[snake.getPlayerId()] = snake;
        log.debug(`Player ${snake.getPlayerId()} added.`);
    }

    removePlayer(playerId: string): void {
        log.debug("removing player", playerId);
        const playerSnake: PhaserSnake = this.players[playerId];
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
import {GameStateEnum} from "./constants/GameStateEnum";
import {GameSessionUtil} from "../server/util/GameSessionUtil";
import {GameSessionConfig} from "./GameSessionConfig";
import {Player} from "./Player";
import {Collectable} from "./model/Collectable";
import {Server} from "socket.io";
import SpawnerDaemon from "../server/SpawnerDaemon";
import {getLogger} from "./config/LogConfig";
import {PlayerRoleEnum} from "./constants/PlayerRoleEnum";
import {PositionUtil} from "../server/util/PositionUtil";

const log = getLogger("shared.GameSession");

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

    getPlayer(playerId: string): Player {
        return this.players[playerId];
    }

    getPlayersAsArray(): Player[] {
        return Object.values(this.players);
    }

    getPlayerCount(): number {
        return Object.keys(this.players).length;
    }

    getOwnerId(): string {
        return this.ownerId;
    }

    getGameState(): GameStateEnum {
        return this.gameState;
    }

    setGameState(state: GameStateEnum) {
        this.gameState = state;
    }

    getConfig() {
        return this.config;
    }

    getCollectables() {
        return this.collectables;
    }

    getCollectableById(id: string): Collectable | undefined {
        return this.collectables[id];
    }

    setConfig(config: GameSessionConfig) {
        this.config = config;
    }

    addPlayer(player: Player): void {
        player.setBodyPositions([PositionUtil.randomUniquePosition(this)]);
        this.players[player.getId()] = player;
    }

    addCollectable(collectable: Collectable): void {
        this.collectables[collectable.getId()] = collectable;
    }

    addCollectables(collectables: Record<string, Collectable>): void {
        Object.keys(collectables).forEach((collectableId) => {
            this.collectables[collectableId] = collectables[collectableId];
        })
    }

    removePlayer(playerId: string): void {
        delete this.players[playerId];
        if (this.ownerId === playerId) {
            if (this.getPlayersAsArray().length > 0) {
                const firstPlayerInList = this.getPlayersAsArray()[0];
                this.ownerId = firstPlayerInList.getId();
                firstPlayerInList.setRole(PlayerRoleEnum.HOST);
            }
        }
    }

    removeCollectable(collectableId: string): void {
        if (this.collectables[collectableId]) {
            delete this.collectables[collectableId];
        }
    }

    hasPlayers(): boolean {
        return Object.keys(this.players).length > 0;
    }

    isWaitingForPlayers(): boolean {
        log.debug(`game session ${this.id} waiting for players`);
        return this.gameState === GameStateEnum.WAITING_FOR_PLAYERS;
    }

    start(io: Server): boolean {
        if (this.gameState === GameStateEnum.READY) {
            this.setGameState(GameStateEnum.RUNNING);

            /* initialize collectables spawner */
            const spawner = SpawnerDaemon.getInstance();
            spawner.startSpawner(this, io);
            return true;
        }

        log.warn(`Game Session ${this.id} state is not ready.`);
        return false;
    }

    toJson() {
        return {
            id: this.id,
            ownerId: this.ownerId,
            gameState: this.gameState,
            config: this.config.toJson(),
            players: Object.fromEntries(
                Object.entries(this.players).map(([id, player]) => [id, player.toJson()])
            ),
            collectables: Object.fromEntries(
                Object.entries(this.collectables).map(([id, collectable]) => [id, collectable.toJson()])
            ),
        };
    }

    static fromData(data: any): GameSession {
        log.debug("fromData", data);
        return new GameSession(
            data.id,
            data.ownerId,
            GameSessionConfig.fromData(data.config),
            data.gameState,
            Object.fromEntries(
                Object.entries(data.players).map(([id, playerData]) => [id, Player.fromData(playerData)])
            ),
            Object.fromEntries(
                Object.entries(data.collectables).map(([id, collectableData]) => [id, Collectable.fromData(collectableData)])
            )
        );
    }
}
import {PlayerManager} from "./PlayerManager";
import {CollisionTypeEnum} from "../../../../shared/constants/CollisionTypeEnum";
import {CollectableManager} from "./CollectableManager";
import {GameSocketManager} from "./GameSocketManager";
import {PhaserSnake} from "../PhaserSnake";
import {SpatialGrid} from "../SpatialGrid";
import socket from "../../../socket/socket";
import {SocketEvents} from "../../../../shared/constants/SocketEvents";
import {getLogger} from "../../../../shared/config/LogConfig";
import {ObstacleManager} from "./ObstacleManager";

const log = getLogger("client.game.ui.manager.CollisionManager");

export class CollisionManager {
    private playerManager: PlayerManager;
    private collectableManager: CollectableManager;
    private obstacleManager: ObstacleManager;
    private gameSocketManager: GameSocketManager;
    private spatialGrid: SpatialGrid;

    constructor(
        playerManager: PlayerManager,
        collectableManager: CollectableManager,
        obstacleManager: ObstacleManager,
        gameSocketManager: GameSocketManager) {
        this.playerManager = playerManager;
        this.collectableManager = collectableManager;
        this.obstacleManager = obstacleManager;
        this.gameSocketManager = gameSocketManager;

        // create a spacial grip with suitable cell size
        this.spatialGrid = new SpatialGrid(25);
    }

    public handleCollisionUpdate(player: PhaserSnake) {
        log.trace("handling collision update", player);

        // only check collision check when snake is alive
        if (!player?.isAlive()) return;

        this.obstacleManager.checkCollisions(player, () =>
            this.handlePlayerCollision(player, CollisionTypeEnum.OBSTACLE)
        );

        this.collectableManager.checkCollisions(player, (uuid: string) =>
            this.handleCollectableCollision(uuid, player)
        );

        const {worldCollision, selfCollision} = player.checkCollisions();
        if (worldCollision) {
            this.handlePlayerCollision(player, CollisionTypeEnum.WORLD);
        }
        if (selfCollision) {
            this.handlePlayerCollision(player, CollisionTypeEnum.SELF);
        }

        this.updateSpatialGrid(); // update the grid with current player positions
        this.checkPlayerToPlayerCollisions(player);
    }

    private handleCollectableCollision(uuid: string, playerSnake: PhaserSnake): void {
        const collectable = this.collectableManager.getCollectable(uuid);
        if (!collectable) return;

        socket.emitWithLog(SocketEvents.GameEvents.ITEM_COLLECTED, uuid, (response: any) => {
            if (response.status) {
                collectable.applyAndDestroy(playerSnake);
            }
            this.collectableManager.removeCollectable(uuid);
        });
    }

    private handlePlayerCollision(player: PhaserSnake, collisionType: CollisionTypeEnum) {
        socket.emitWithLog(SocketEvents.GameEvents.COLLISION, collisionType, (response: any) => {
            if (response.status) {
                player.die();
            }
        });
    }

    private updateSpatialGrid(): void {
        this.spatialGrid.clear();
        const players = this.playerManager.getPlayersExcept(this.gameSocketManager.getPlayerId())
        for (const player of players) {
            if (player?.isAlive()) { // only add players that are alive to collision checks
                this.spatialGrid.addSnake(player);
            }
        }
    }

    private checkPlayerToPlayerCollisions(localPlayer: PhaserSnake) {
        const potentialColliders = this.spatialGrid.getPotentialColliders(localPlayer);
        const localPlayerHead = localPlayer.getHead();

        for (const otherPlayer of potentialColliders) {
            if (otherPlayer.getPlayerId() === localPlayer.getPlayerId()) {
                continue; // skip when local player is also other player.
            }

            for (const bodyPart of otherPlayer.getBody()) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(localPlayerHead.getBounds(), bodyPart.getBounds())) {
                    this.handlePlayerCollision(localPlayer, CollisionTypeEnum.PLAYER);
                    return; // Only handle the first collision
                }
            }
        }
    }
}
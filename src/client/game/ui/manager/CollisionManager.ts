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
import {PhaserCollectable} from "../PhaserCollectable";
import {PhaserObstacle} from "../PhaserObstacle";

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
        this.spatialGrid = new SpatialGrid(100);
    }

    public handleCollisionUpdate(player: PhaserSnake) {
        // only check collision check when snake is alive
        if (!player?.isAlive()) return;

        log.trace("handling collision update", player);

        this.updateSpatialGrid(); // update the grid with current player positions
        this.checkCollisions(player);

        const {worldCollision, selfCollision} = player.checkCollisions();
        if (worldCollision) {
            this.handlePlayerCollision(player, CollisionTypeEnum.WORLD);
        }
        if (selfCollision) {
            this.handlePlayerCollision(player, CollisionTypeEnum.SELF);
        }

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

        // add all alive players to the grid
        const players = this.playerManager.getPlayersExcept(this.gameSocketManager.getPlayerId())
        for (const player of players) {
            if (player?.isAlive()) {
                this.spatialGrid.addGameObject(player);
            }
        }

        // add all collectables to the grid
        const collectables = this.collectableManager.getAllCollectables();
        for (const collectable of collectables) {
            this.spatialGrid.addGameObject(collectable);
        }

        const obstacles = this.obstacleManager.getAllObstacles();
        for (const obstacle of obstacles) {
            this.spatialGrid.addGameObject(obstacle);
        }

        log.trace("spatialGrid.update", this.spatialGrid);
    }

    private checkCollisions(localPlayer: PhaserSnake) {
        const localPlayerHead = localPlayer.getHead();
        const width = localPlayerHead.displayWidth
        const height = localPlayerHead.displayHeight;
        const potentialColliders: Set<PhaserSnake | PhaserCollectable | PhaserObstacle> = this.spatialGrid.getPotentialColliders(localPlayerHead.x, localPlayerHead.y, width, height);

        log.trace("potentialColliders", potentialColliders);
        for (const collider of potentialColliders) {
            if (collider instanceof PhaserSnake) {
                // handle player-to-player collisions
                if (collider.getPlayerId() !== localPlayer.getPlayerId()) {
                    for (const bodyPart of collider.getBody()) {
                        if (Phaser.Geom.Intersects.RectangleToRectangle(localPlayerHead.getBounds(), bodyPart.getBounds())) {
                            this.handlePlayerCollision(localPlayer, CollisionTypeEnum.PLAYER);
                            return; // Only handle the first collision
                        }
                    }
                }
            } else if (collider instanceof PhaserCollectable) {
                // handle collectable collisions
                if (Phaser.Geom.Intersects.RectangleToRectangle(localPlayerHead.getBounds(), collider.getBody().getBounds())) {
                    this.handleCollectableCollision(collider.getId(), localPlayer);
                }
            } else if (collider instanceof PhaserObstacle) {
                // handle obstacle collisions
                if (Phaser.Geom.Intersects.RectangleToRectangle(localPlayerHead.getBounds(), collider.getBody().getBounds())) {
                    this.handlePlayerCollision(localPlayer, CollisionTypeEnum.OBSTACLE);
                }
            }
        }
    }
}
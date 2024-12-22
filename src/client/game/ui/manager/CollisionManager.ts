import {PlayerManager} from "./PlayerManager";
import {PlayerStatusEnum} from "../../../../shared/constants/PlayerStatusEnum";
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

    constructor(
        playerManager: PlayerManager,
        collectableManager: CollectableManager,
        obstacleManager: ObstacleManager,
        gameSocketManager: GameSocketManager) {
        this.playerManager = playerManager;
        this.collectableManager = collectableManager;
        this.obstacleManager = obstacleManager;
        this.gameSocketManager = gameSocketManager;
    }

    public handleCollisionUpdate() {
        const player = this.playerManager.getPlayer(this.gameSocketManager.getPlayerId());
        log.trace("handling collision update", player);

        // only collision check when snake is alive
        if (player?.getStatus() !== PlayerStatusEnum.ALIVE) return;

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

        this.checkPlayerToPlayerCollisions(player, this.playerManager.getPlayersExcept(this.gameSocketManager.getPlayerId()));
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
                player.setStatus(PlayerStatusEnum.DEAD);
            }
        });
    }

    private checkPlayerToPlayerCollisions(localPlayer: PhaserSnake, otherPlayers: PhaserSnake[]) {
        // create a spacial grip with suitable cell size
        const spatialGrid = new SpatialGrid(25);
        for (const player of otherPlayers) {
            // only add players that are alive to collision checks
            if (player.getStatus() === PlayerStatusEnum.ALIVE) {
                spatialGrid.addSnake(player);
            }
        }

        const potentialColliders = spatialGrid.getPotentialColliders(localPlayer);
        const localPlayerHead = localPlayer.getHead();

        for (const otherPlayer of potentialColliders) {
            if (otherPlayer.getPlayerId() === localPlayer.getPlayerId()) {
                continue; // skip when local player is also other player.
            }

            for (const bodyPart of otherPlayer.getBody()) {
                const bodySegment = bodyPart as Phaser.Physics.Arcade.Sprite;
                if (Phaser.Geom.Intersects.RectangleToRectangle(localPlayerHead.getBounds(), bodySegment.getBounds())) {
                    this.handlePlayerCollision(localPlayer, CollisionTypeEnum.PLAYER);
                    return; // Only handle the first collision
                }
            }
        }
    }
}
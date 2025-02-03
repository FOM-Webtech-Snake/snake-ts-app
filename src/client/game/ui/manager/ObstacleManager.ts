import {getLogger} from "../../../../shared/config/LogConfig";
import {Position} from "../../../../shared/model/Position";
import {GameSocketManager} from "./GameSocketManager";
import {PhaserObstacle} from "../PhaserObstacle";
import {Obstacle} from "../../../../shared/model/Obstacle";

const log = getLogger("client.game.ui.manager.CollectableManager");

export class ObstacleManager {
    private scene: Phaser.Scene;
    private gameSocketManager: GameSocketManager;
    private obstacles: Record<string, PhaserObstacle>;

    constructor(scene: Phaser.Scene, gameSocketManager: GameSocketManager) {
        this.scene = scene;
        this.gameSocketManager = gameSocketManager;
        this.obstacles = {};

        this.registerEventListeners();
    }

    private registerEventListeners() {
        this.gameSocketManager.on("SPAWN_NEW_OBSTACLE", (obstacle: Obstacle) => {
            this.addObstacle(PhaserObstacle.fromObstacle(this.scene, obstacle));
        })

        this.gameSocketManager.on("RESET_GAME", () => {
            this.reset();
        });
    }

    addObstacle(obstacle: PhaserObstacle) {
        log.trace("adding obstacle", obstacle);
        if (this.obstacles[obstacle.getId()]) {
            log.warn(`obstacle ${obstacle.getId()} already exists.`);
            return;
        }
        this.obstacles[obstacle.getId()] = obstacle;
        log.debug(`obstacle ${obstacle.getId()} added.`);
    }

    removeObstacle(uuid: string): void {
        log.debug("removeObstacle", uuid);
        const obstacle = this.obstacles[uuid];
        if (obstacle) {
            obstacle.destroy();
            delete this.obstacles[uuid];
        }
    }

    getAllObstacles(): PhaserObstacle[] {
        return Object.values(this.obstacles);
    }

    getPositionsFromAllObstacles(): Position[] {
        return this.getAllObstacles().map(obstacle => obstacle.getPosition());
    }

    getObstacle(uuid: string): PhaserObstacle | null {
        log.debug("getObstacle", uuid);
        return this.obstacles[uuid] || null;
    }

    update() {
        // nothing to do.
    }

    private reset(): void {
        log.debug("clearing all obstacles");
        Object.values(this.obstacles).forEach(obstacle => obstacle?.destroy());
        this.obstacles = {};
    }
}

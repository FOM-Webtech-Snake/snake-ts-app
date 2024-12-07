import {PhaserSnake} from "../PhaserSnake";
import {PhaserCollectable} from "../PhaserCollectable";
import {getLogger} from "../../../../shared/config/LogConfig";
import {Collectable} from "../../../../shared/model/Collectable";
import {Position} from "../../../../shared/model/Position";
import {GameSocketManager} from "./GameSocketManager";

const log = getLogger("client.game.ui.manager.CollectableManager");

export class CollectableManager {
    private scene: Phaser.Scene;
    private gameSocketManager: GameSocketManager;
    private collectables: Record<string, PhaserCollectable>;

    constructor(scene: Phaser.Scene, gameSocketManager: GameSocketManager) {
        this.scene = scene;
        this.gameSocketManager = gameSocketManager;
        this.collectables = {};

        this.registerEventListeners();
    }

    private registerEventListeners() {
        this.gameSocketManager.on("ITEM_COLLECTED", (uuid: string) => {
            this.removeCollectable(uuid);
        });

        this.gameSocketManager.on("SPAWN_NEW_COLLECTABLE", (collectable: Collectable) => {
            this.addCollectable(PhaserCollectable.fromCollectable(this.scene, collectable));
        })
    }

    addCollectable(collectable: PhaserCollectable) {
        log.trace("adding collectable", collectable);
        if (this.collectables[collectable.getId()]) {
            log.warn(`collectable ${collectable.getId()} already exists.`);
            return;
        }
        this.collectables[collectable.getId()] = collectable;
        log.debug(`collectable ${collectable.getId()} added.`);
    }

    removeCollectable(uuid: string): void {
        log.debug("removeCollectable", uuid);
        const collectable = this.collectables[uuid];
        if (collectable) {
            collectable.destroy();
            delete this.collectables[uuid];
        }
    }

    getAllCollectables(): PhaserCollectable[] {
        return Object.values(this.collectables);
    }

    getPositionsFromAllCollectables(): Position[] {
        return this.getAllCollectables().map(collectable => collectable.getPosition());
    }

    getCollectable(uuid: string): PhaserCollectable | null {
        log.debug("getCollectable", uuid);
        return this.collectables[uuid] || null;
    }

    // update all collectables (incl. arrows and collisions)
    update(): void {
        log.debug("updating collectables and arrows");
        Object.keys(this.collectables).forEach(uuid => {
            const collectable = this.collectables[uuid];

            // skip if collectable is null or destroyed
            if (!collectable) return;

            // update arrow visibility and position
            collectable.updateArrow(this.scene.cameras.main);
        });
    }

    checkCollisions(snake: PhaserSnake, onCollision: (uuid: string) => void): void {
        log.debug("checking collectables for collisions");
        Object.keys(this.collectables).forEach(uuid => {
            const collectable = this.collectables[uuid];
            if (!collectable) return;

            // check for collisions with the snake
            if (collectable.checkCollision(snake)) {
                onCollision(uuid); // Callback to handle the collect event
            }
        });
    }

    clear(): void {
        log.debug("clear all collectables");
        Object.values(this.collectables).forEach(collectable => collectable?.destroy());
        this.collectables = {};
    }
}

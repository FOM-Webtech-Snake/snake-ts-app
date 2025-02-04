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

        this.gameSocketManager.on("RESET_GAME", () => {
            this.reset();
        });
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
            // if available update arrow visibility and position
            this.collectables[uuid]?.updateArrow(this.scene.cameras.main);
        });
    }

    private reset(): void {
        log.debug("clearing all collectables");
        Object.values(this.collectables).forEach(collectable => collectable?.destroy());
        this.collectables = {};
    }
}

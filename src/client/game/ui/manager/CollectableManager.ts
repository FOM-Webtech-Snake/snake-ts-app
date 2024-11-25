import {PhaserSnake} from "../PhaserSnake";
import {PhaserCollectable} from "../PhaserCollectable";
import {getLogger} from "../../../../shared/config/LogConfig";
import {Collectable} from "../../../../shared/model/Collectable";
import {Position} from "../../../../shared/model/Position";

const log = getLogger("client.game.ui.manager.CollectableManager");

export class CollectableManager {
    private scene: Phaser.Scene;
    private collectables: Record<string, PhaserCollectable>;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.collectables = {};
    }

    spawnCollectable(data: any): void {
        log.debug("spawnCollectable", data);
        const phaserCollectable = PhaserCollectable.fromCollectable(this.scene, Collectable.fromData(data));
        this.collectables[phaserCollectable.getId()] = phaserCollectable;
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
    update(snake: PhaserSnake, camera: Phaser.Cameras.Scene2D.Camera, onCollect: (uuid: string) => void): void {
        log.debug("updating collectables");
        Object.keys(this.collectables).forEach(uuid => {
            const collectable = this.collectables[uuid];

            // skip if collectable is null or destroyed
            if (!collectable) return;

            // update arrow visibility and position
            collectable.updateArrow(camera);

            // check for collisions with the snake
            if (collectable.checkCollision(snake)) {
                onCollect(uuid); // Callback to handle the collect event
            }
        });
    }

    clear(): void {
        log.debug("clear all collectables");
        Object.values(this.collectables).forEach(collectable => collectable?.destroy());
        this.collectables = {};
    }
}

import {GameSession} from "../../shared/GameSession";
import {Server} from "socket.io";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {Collectable} from "../../shared/model/Collectable";
import {PositionUtil} from "./PositionUtil";
import {ChildCollectableTypeEnum} from "../../shared/constants/CollectableTypeEnum";
import {getLogger} from "../../shared/config/LogConfig";

const log = getLogger("server.util.SpawnUtil");

export class SpawnUtil {

    static getRandomSpawnDelay(min: number, max: number) {
        if (min > max) {
            throw new Error("min value must be less or at least equal to max");
        }
        if (min === max) {
            return min;
        }

        return Math.floor(Math.random() * (max - min)) + min;
    }

    static spawnNewCollectableWithDelay(io: Server, session: GameSession) { // TODO , parentType) {
        log.debug(`spawning collectables with delay for game session ${session.getId()}`);
        let delay = this.getRandomSpawnDelay(5000, 5000);// TODO, parentType.maxSpawnDelay);
        setTimeout(() => {
            // Generate a new item for the session
            let newCollectable: Collectable = this.createCollectable(session); // TODO parentType);
            session.addCollectable(newCollectable);

            // notify all players in the session that a new item has been spawned
            io.to(session.getId()).emit(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, newCollectable);
            log.debug(`new collectable of type xx spawned after ${delay}ms delay.`);
        }, delay);
    }

    static createCollectable(session: GameSession) {
        const position = PositionUtil.randomPosition(session.getConfig());
        return new Collectable(null, ChildCollectableTypeEnum.FOOD, position);
    }

    // TODO
    static spawnCollectables(session: GameSession): void {
        const collectables: Record<string, Collectable> = {};

        /* TODO add more than one collectable */
        const collectable = this.createCollectable(session);
        collectables[collectable.getId()] = collectable;

        session.addCollectables(collectables);
    }

}
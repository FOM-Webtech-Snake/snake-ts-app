import {GameSession} from "../../shared/model/GameSession";
import {Server} from "socket.io";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {Collectable} from "../../shared/model/Collectable";
import {PositionUtil} from "./PositionUtil";
import {ChildCollectableTypeEnum} from "../../shared/constants/CollectableTypeEnum";
import {getLogger} from "../../shared/config/LogConfig";
import {childCollectables} from "../../shared/config/Collectables";
import {v4 as uuidV4} from "uuid";
import {Position} from "../../shared/model/Position";
import {Obstacle} from "../../shared/model/Obstacle";
import {ObstacleTypeEnum} from "../../shared/constants/ObstacleTypeEnum";

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

    static spawnNewCollectableWithDelay(io: Server, session: GameSession) {
        const delay = this.getRandomSpawnDelay(1000, 5000);
        log.debug(`spawning collectables with delay for game session ${session.getId()}`);
        setTimeout(() => {
            // Generate a new item for the session
            const newCollectable: Collectable = this.createCollectable(session);
            session.addCollectable(newCollectable);

            // notify all players in the session that a new item has been spawned
            io.to(session.getId()).emit(SocketEvents.GameEvents.SPAWN_NEW_COLLECTABLE, newCollectable);
            log.debug(`new collectable of type ${newCollectable.getType()} spawned after ${delay}ms delay.`);
        }, delay);
    }

    static spawnNewObstacle(io: Server, position: Position, session: GameSession) {
        if (position === null) return;
        const newObstacle = new Obstacle(uuidV4(), ObstacleTypeEnum.GRAVESTONE, position);
        session.addObstacle(newObstacle);

        io.to(session.getId()).emit(SocketEvents.GameEvents.SPAWN_NEW_OBSTACLE, newObstacle);
        log.debug(`new obstacle of type ${newObstacle.getType()} spawned.`);

    }

    static createCollectable(session: GameSession) {
        const position = PositionUtil.randomUniquePosition(session);
        const randomType = this.getRandomCollectableType();
        return new Collectable(uuidV4(), randomType, position);
    }

    static getRandomCollectableType(): ChildCollectableTypeEnum {
        const weightedPool: { type: ChildCollectableTypeEnum; weight: number }[] = Object.values(childCollectables)
            .map(({type, spawnChance}) => ({type, weight: spawnChance}));

        const totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);
        const randomWeight = Math.random() * totalWeight;

        let cumulativeWeight = 0;
        for (const item of weightedPool) {
            cumulativeWeight += item.weight;
            if (randomWeight <= cumulativeWeight) {
                return item.type;
            }
        }

        // Fallback in case no collectable is selected
        return ChildCollectableTypeEnum.FOOD;
    }

}
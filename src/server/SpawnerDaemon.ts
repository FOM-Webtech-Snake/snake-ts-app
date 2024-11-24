import {Server} from "socket.io";

import {GameStateEnum} from "../shared/constants/GameStateEnum";
import {GameSession} from "../shared/GameSession";
import {SpawnUtil} from "./util/SpawnUtil";
import {getLogger} from "../shared/config/LogConfig";

const log = getLogger("server.SpawnerDaemon");

class SpawnerDaemon {
    private static instance: SpawnerDaemon;
    private activeSpawners: Map<string, NodeJS.Timeout>;

    private constructor() {
        this.activeSpawners = new Map();
    }

    static getInstance(): SpawnerDaemon {
        if (!SpawnerDaemon.instance) {
            SpawnerDaemon.instance = new SpawnerDaemon();
        }
        return SpawnerDaemon.instance;
    }

    startSpawner(session: GameSession, io: Server): void {
        if (this.activeSpawners.has(session.getId())) {
            log.warn(`Spawner already running for session ${session.getId()}`);
            return;
        }

        const playerCount = session.getPlayerCount();
        let spawnInterval = this.calculateSpawnInterval(playerCount);

        log.info(`Starting spawner for session ${session.getId()} with interval ${spawnInterval}ms`);

        const interval = setInterval(() => {
            if (session.getGameState() === GameStateEnum.RUNNING) {
                SpawnUtil.spawnNewCollectableWithDelay(io, session);
            } else if (session.getGameState() === GameStateEnum.PAUSED
                || session.getGameState() === GameStateEnum.WAITING_FOR_PLAYERS) {
                // do nothing, just wait for the status to change
            } else {
                log.warn(`Session ${session.getId()} is not running. Stopping spawner.`);
                this.stopSpawner(session.getId());
            }
        }, spawnInterval);

        this.activeSpawners.set(session.getId(), interval);
    }

    stopSpawner(sessionId: string): void {
        const interval = this.activeSpawners.get(sessionId);
        if (interval) {
            clearInterval(interval);
            this.activeSpawners.delete(sessionId);
            log.info(`Stopped spawner for session ${sessionId}`);
        } else {
            log.warn(`No active spawner found for session ${sessionId}`);
        }
    }

    stopAllSpawners(): void {
        this.activeSpawners.forEach((interval, sessionId) => {
            clearInterval(interval);
            log.info(`Stopped spawner for session ${sessionId}`);
        });
        this.activeSpawners.clear();
    }

    private calculateSpawnInterval(playerCount: number): number {
        if (playerCount < 3) {
            return 5000; // 5 seconds if there are fewer snakes
        } else if (playerCount <= 5) {
            return 3000; // 3 seconds if there are a moderate number of snakes
        } else {
            return 2000; // 2 seconds for many snakes (faster spawning)
        }
    }
}

export default SpawnerDaemon;

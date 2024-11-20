import {GameSession} from "../../shared/GameSession";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import {getLogger} from "../../shared/config/LogConfig";
import {Server} from "socket.io";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {SpawnUtil} from "./SpawnUtil";

const log = getLogger("server.util.GameSessionUtil");

export class GameSessionUtil {

    static generateSessionId(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: "AB12CD"
    }

    /* game control methods */
    static startGame(session: GameSession, io: Server): boolean {
        if (session.getGameState() === GameStateEnum.WAITING_FOR_PLAYERS) {
            log.info(`Starting game session ${session.getId()}`);
            /* start the game */
            if (io) {
                log.info("session", session);
                io.timeout(5000).to(session.getId()).emit(SocketEvents.GameControl.START_GAME, (err, response) => {
                    if (err) {
                        // TODO some clients did not acknowledge
                    } else {
                        console.debug(response);
                    }
                });
            }
            session.setGameState(GameStateEnum.RUNNING);

            /* spawn Collectables */
            SpawnUtil.spawnNewCollectableWithDelay(io, session);

            /* TODO spawn Snakes */
            return true;
        }

        log.warn(`Game Session ${session.getId()} state is not ready.`);
        return false;
    }


}
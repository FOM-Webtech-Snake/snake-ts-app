import {GameSession} from "../../shared/GameSession";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import {getLogger} from "../../shared/config/LogConfig";
import {Server} from "socket.io";
import {SocketEvents} from "../../shared/constants/SocketEvents";


const log = getLogger("server.util.GameSessionUtil");

export class GameSessionUtil {

    static generateSessionId(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: "AB12CD"
    }


    /* game control methods */
    static startGame(session: GameSession, io: Server): boolean {
        log.info("Starting game session", session);
        if (session.getGameState() === GameStateEnum.WAITING_FOR_PLAYERS) {
            /* TODO spawn Collectables */
            /* TODO spawn Snakes */
            /* start the game */
            session.setGameState(GameStateEnum.RUNNING);
            if (io) io.to(session.getId()).emit(SocketEvents.GameControl.START_GAME);
            return true;
        }

        log.warn(`Game state is not ready.`);
        return false;

    }
}
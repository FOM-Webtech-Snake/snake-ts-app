import {GameSession} from "../../shared/GameSession";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import {Server} from "socket.io";
import SpawnerDaemon from "../SpawnerDaemon";
import {SocketEvents} from "../../shared/constants/SocketEvents";


export class GameSessionUtil {

    static generateSessionId(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: "AB12CD"
    }

    /* game control methods */
    static startGame(session: GameSession, io: Server): boolean {
        if (session.getGameState() === GameStateEnum.WAITING_FOR_PLAYERS) {
            console.log(`Starting game session ${session.getId()}`);
            session.setGameState(GameStateEnum.RUNNING);

            io.to(session.getId()).emit(SocketEvents.GameControl.START_GAME);

            /* Initialize Collectables Spawner */
            const spawner = SpawnerDaemon.getInstance();
            spawner.startSpawner(session, io);

            return true;
        }

        console.warn(`Game Session ${session.getId()} state is not ready.`);
        return false;
    }


}

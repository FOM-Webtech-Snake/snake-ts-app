import {GameSession} from "../../shared/GameSession";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import {Server, Socket} from "socket.io";
import SpawnerDaemon from "../SpawnerDaemon";
import {SocketEvents} from "../../shared/constants/SocketEvents";


export class GameSessionUtil {

    static generateSessionId(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: "AB12CD"
    }

    /* game control methods */
    static readyGame(session: GameSession, io: Server): boolean {
        if (session.getGameState() === GameStateEnum.WAITING_FOR_PLAYERS) {
            console.log(`Starting game session ${session.getId()}`);

            io.to(session.getId()).timeout(5000).emit(SocketEvents.GameControl.GET_READY, (err) => {
                if (err) {
                    console.warn(
                        `Not all clients responded in time for session ${session.getId()}`
                    );
                    return false;
                } else {
                    console.log(`game session start confirmed from all clients`);
                    session.setGameState(GameStateEnum.READY);
                    return true;
                }
            });
        }

        console.warn(`Game Session ${session.getId()} state not waiting for players.`);
        return false;
    }

    static startGame(session: GameSession, io: Server): boolean {
        if (session.getGameState() === GameStateEnum.READY) {
            session.setGameState(GameStateEnum.RUNNING);

            /* initialize collectables spawner */
            const spawner = SpawnerDaemon.getInstance();
            spawner.startSpawner(session, io);
            return true;
        }

        console.warn(`Game Session ${session.getId()} state is not ready.`);
        return false;
    }

    static removeCollectable(collectableId: string, session: GameSession, socket: Socket): void {
        session.removeCollectable(collectableId);
        socket.to(session.getId()).emit(SocketEvents.GameEvents.ITEM_COLLECTED, collectableId);
    }


}

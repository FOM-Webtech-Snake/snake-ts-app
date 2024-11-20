import {Server, Socket} from 'socket.io';
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {sessionManager} from "../SessionManager";
import {getLogger} from "../../shared/config/LogConfig";
import {GameSession} from "../../shared/GameSession";
import {GameSessionUtil} from "../util/GameSessionUtil";

const log = getLogger("server.sockets.Socket");
const configureServerSocket = (io: Server) => {
    io.on(SocketEvents.Connection.CONNECTION, (socket: Socket) => {
        log.info(`user connected: ${socket.id}`);

        // Example of handling a custom event (e.g., joining a game room)
        socket.on(SocketEvents.Connection.JOIN_SESSION, (sessionId: string) => {
            const session: GameSession = sessionManager.getSession(sessionId);

            function removePlayerFromSession() {
                session.removePlayer(socket.id);
                if (!session.hasPlayers()) {
                    log.info(`session ${sessionId} has no players left, deleting session`);
                    sessionManager.deleteSession(session.getId());
                } else {
                    socket.to(sessionId).emit(SocketEvents.SessionState.DISCONNECTED, socket.id);
                }
            }

            if (session) {
                socket.join(sessionId);
                log.info(`user ${socket.id} joined session: ${sessionId}`);

                socket.emit(SocketEvents.Connection.JOIN_SESSION, session);

                // get configuration event
                socket.on(SocketEvents.SessionState.GET_CURRENT_SESSION, () => {
                    log.debug(`get session called by ${socket.id}`);
                    socket.emit(SocketEvents.SessionState.CURRENT_SESSION, session);
                });

                // game start event
                socket.on(SocketEvents.GameControl.START_GAME, () => {
                    log.debug(`game session (${sessionId}) started by ${socket.id}`);
                    if (session.getOwnerId() === socket.id) { // make sure that only the owner can start a game session
                        GameSessionUtil.startGame(session, io);
                    }
                });

                socket.on(SocketEvents.PlayerActions.PLAYER_MOVEMENT, (snake: string) => {
                    log.trace(`player ${socket.id} moved snake ${snake}`);
                    socket.to(sessionId).emit(SocketEvents.PlayerActions.PLAYER_MOVEMENT, snake);
                    // TODO session.updatePlayerSnake();
                });

                socket.on(SocketEvents.GameEvents.ITEM_COLLECTED, (uuid: string) => {
                    log.debug(`item ${uuid} collected by ${socket.id}`);
                });

                // player leave session event
                socket.on(SocketEvents.Connection.LEAVE_SESSION, () => {
                    removePlayerFromSession();
                });

                // player disconnected event
                socket.on(SocketEvents.Connection.DISCONNECT, () => {
                    removePlayerFromSession();
                });


            } else {
                console.error(`session id ${sessionId} not found`);
                socket.emit("error", {message: "session not found"});
            }
        });


        // Handle disconnection
        socket.on(SocketEvents.Connection.DISCONNECT, () => {
            log.info(`user disconnected: ${socket.id}`);
        });
    });
};

export default configureServerSocket;

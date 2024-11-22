import {Server, Socket} from 'socket.io';
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {sessionManager} from "../SessionManager";
import {getLogger} from "../../shared/config/LogConfig";
import {GameSession} from "../../shared/GameSession";
import {GameSessionUtil} from "../util/GameSessionUtil";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import {Player} from "../../shared/Player";
import {DEFAULT_GAME_SESSION_CONFIG} from "../../shared/GameSessionConfig";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";

const log = getLogger("server.sockets.Socket");
const configureServerSocket = (io: Server) => {
    io.on(SocketEvents.Connection.CONNECTION, (socket: Socket) => {
        log.info(`user connected: ${socket.id}`);


        socket.on(SocketEvents.Connection.CREATE_SESSION, (playerName: string, callback) => {
            // Create and store the game session
            const newPlayer = new Player(socket.id, playerName, PlayerRoleEnum.HOST);
            const newGame = sessionManager.createSession(newPlayer, DEFAULT_GAME_SESSION_CONFIG);
            log.info(`created new game session: ${newGame.getId()} - ${newGame.getOwnerId()}`);
            callback(newGame);
            handleSessionJoin(socket, newGame);
        });

        socket.on(SocketEvents.Connection.JOIN_SESSION, (sessionId: string, playerName: string, callback) => {
            try {
                const newPlayer = new Player(socket.id, playerName, PlayerRoleEnum.GUEST);
                const session = sessionManager.joinSession(sessionId, newPlayer);
                log.info(`player ${socket.id} joined game session: ${sessionId}`);
                callback(session);
                handleSessionJoin(socket, session);
            } catch (error) {
                callback({error: "Session not found"});
            }
        });

        // Handle disconnection
        socket.on(SocketEvents.Connection.DISCONNECT, () => {
            log.info(`user disconnected: ${socket.id}`);
        });

        function handleSessionJoin(socket: Socket, session: GameSession) {
            socket.join(session.getId());
            log.info(`User ${socket.id} joined session: ${session.getId()}`);

            // Set up event handlers
            socket.on(SocketEvents.SessionState.GET_CURRENT_SESSION, () => {
                log.debug(`Get session called by ${socket.id}`);
                socket.emit(SocketEvents.SessionState.CURRENT_SESSION, session);
            });

            socket.on(SocketEvents.GameControl.GET_READY, () => {
                log.debug(`Game session (${session.getId()}) ready by ${socket.id}`);
                if (session.getOwnerId() === socket.id) {
                    GameSessionUtil.readyGame(session, io);
                }
            });

            socket.on(SocketEvents.GameControl.START_GAME, () => {
                log.info(`Game session (${session.getId()}) started by ${socket.id}`);
                if (GameSessionUtil.startGame(session, io)) {
                    io.to(session.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, session.getGameState());
                }
            });

            socket.on(SocketEvents.GameControl.STATE_CHANGED, (state: GameStateEnum) => {
                if (session.getGameState() !== state) {
                    session.setGameState(state);
                    io.to(session.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, state);
                }
            });

            socket.on(SocketEvents.PlayerActions.PLAYER_MOVEMENT, (snake: string) => {
                log.trace(`Player ${socket.id} moved snake ${snake}`);
                socket.to(session.getId()).emit(SocketEvents.PlayerActions.PLAYER_MOVEMENT, snake);
            });

            socket.on(SocketEvents.GameEvents.ITEM_COLLECTED, (uuid: string, callback) => {
                log.debug(`Item ${uuid} collected by ${socket.id}`);
                const collectableById = session.getCollectableById(uuid);
                if (collectableById) {
                    callback({status: "ok"});
                    GameSessionUtil.removeCollectable(uuid, session, socket);
                } else {
                    callback({status: "error"});
                }
            });

            socket.on(SocketEvents.Connection.LEAVE_SESSION, () => {
                removePlayerFromSession();
            });

            socket.on(SocketEvents.Connection.DISCONNECT, () => {
                removePlayerFromSession();
            });

            function removePlayerFromSession() {
                session.removePlayer(socket.id);
                socket.to(session.getId()).emit(SocketEvents.SessionState.DISCONNECTED, socket.id);
                if (!session.hasPlayers()) {
                    log.info(`Session ${session.getId()} has no players left, deleting session`);
                    sessionManager.deleteSession(session.getId());
                }
            }
        }
    });
};

export default configureServerSocket;

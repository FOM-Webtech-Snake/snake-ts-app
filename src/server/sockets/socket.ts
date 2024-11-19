import {Server, Socket} from 'socket.io';
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {sessionManager} from "../SessionManager";

const configureServerSocket = (io: Server) => {
    io.on(SocketEvents.Connection.CONNECTION, (socket: Socket) => {
        console.log(`user connected: ${socket.id}`);

        // Example of handling a custom event (e.g., joining a game room)
        socket.on(SocketEvents.Connection.JOIN_SESSION, (sessionId: string) => {
            const session = sessionManager.getSession(sessionId);

            if (session) {
                socket.join(sessionId);
                console.log(`user ${socket.id} joined session: ${sessionId}`);

                socket.emit(SocketEvents.Connection.JOIN_SESSION, session);

                // get configuration event
                socket.on(SocketEvents.SessionState.GET_CURRENT_SESSION, () => {
                    console.log(`get session called by ${socket.id}`);
                    socket.emit(SocketEvents.SessionState.CURRENT_SESSION, session.toJson());
                });

                // game start event
                socket.on(SocketEvents.GameControl.START_GAME, () => {
                    console.log(`game session (${sessionId}) started by ${socket.id}`);
                    socket.to(sessionId).emit(SocketEvents.GameControl.START_GAME);
                });

                socket.on(SocketEvents.Connection.LEAVE_SESSION, () => {
                    session.removePlayer(socket.id);
                    socket.to(sessionId).emit(SocketEvents.SessionState.DISCONNECTED, socket.id);
                    if (!session.hasPlayers()) {
                        console.log(`session ${sessionId} has no players left, deleting session`);
                        sessionManager.deleteSession(session.getId());
                    }
                });

                socket.on(SocketEvents.Connection.DISCONNECT, () => {
                    session.removePlayer(socket.id);
                    socket.to(sessionId).emit(SocketEvents.SessionState.DISCONNECTED, socket.id);
                    if (!session.hasPlayers()) {
                        console.log(`session ${sessionId} has no players left, deleting session`);
                        sessionManager.deleteSession(session.getId());
                    }
                });


            } else {
                console.error(`session id ${sessionId} not found`);
                socket.emit("error", {message: "session not found"});
            }
        });


        // Handle disconnection
        socket.on(SocketEvents.Connection.DISCONNECT, () => {
            console.log(`user disconnected: ${socket.id}`);
        });
    });
};

export default configureServerSocket;

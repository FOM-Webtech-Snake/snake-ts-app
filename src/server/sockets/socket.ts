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

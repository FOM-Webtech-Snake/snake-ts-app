import {Server, Socket} from 'socket.io';
import {SocketEvents} from "../../shared/constants/SocketEvents";

const configureServerSocket = (io: Server) => {
    io.on(SocketEvents.Connection.CONNECTION, (socket: Socket) => {
        console.log(`user connected: ${socket.id}`);

        // Example of handling a custom event (e.g., joining a game room)
        socket.on(SocketEvents.Connection.JOIN_SESSION, (sessionId: string) => {
            socket.join(sessionId);
            console.log(`user ${socket.id} joined session: ${sessionId}`);
        });

        // Handle disconnection
        socket.on(SocketEvents.Connection.DISCONNECT, () => {
            console.log(`user disconnected: ${socket.id}`);

        });
    });
};

export default configureServerSocket;

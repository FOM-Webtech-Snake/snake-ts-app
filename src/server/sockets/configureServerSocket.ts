import {Server, Socket} from 'socket.io';
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {getLogger} from "../../shared/config/LogConfig";
import SocketEventRegistry, {HandlerFn} from "./SocketEventRegistry";

const log = getLogger("server.sockets.configureServerSocket");

const configureServerSocket = (io: Server) => {
    io.on(SocketEvents.Connection.CONNECTION, (socket: Socket) => {
        log.debug(`User connected: ${socket.id}`);

        // Dynamically register all events
        Object.entries(SocketEventRegistry).forEach(([event, handler]) => {
            socket.on(event, (...args: unknown[]) => {
                log.debug(`Event triggered: ${event} by ${socket.id}`);

                // Ensure handler arguments are correctly typed
                try {
                    (handler as HandlerFn<any>)(io, socket, args as any);
                } catch (error) {
                    log.error(`Error handling event "${event}": ${error.message}`);
                    socket.emit("error", {event, message: error.message});
                }
            });
        });

        socket.on(SocketEvents.Connection.DISCONNECT, () => {
            log.debug(`User disconnected: ${socket.id}`);
        });
    });
};

export default configureServerSocket;

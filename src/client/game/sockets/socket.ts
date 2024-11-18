import {SocketEvents} from "../../../shared/constants/SocketEvents";
import {Socket} from "socket.io-client";

const configureClientSocket = (io: Socket) => {
    io.on(SocketEvents.Connection.CONNECT, () => {
        console.log("socket connected");
    });

    io.on(SocketEvents.Connection.DISCONNECT, () => {
        console.log("socket disconnected");
    });
}

export default configureClientSocket;
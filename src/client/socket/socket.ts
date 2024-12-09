import {io, Socket} from "socket.io-client";
import customParser from "socket.io-msgpack-parser";
import {getLogger} from "../../shared/config/LogConfig";

const log = getLogger("client.socket.socket");
const logEvent = (event: string, payload: any) => {
    log.trace("[socket emit] event: ", event, payload);
};

interface ExtendedSocket extends Socket {
    emitWithLog: (event: string, payload?: any, callback?: (response: any) => void) => void;
}

const socket: ExtendedSocket = io({
    parser: customParser,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
}) as ExtendedSocket;

socket.emitWithLog = (event, payload, callback) => {
    logEvent(event, payload);
    if (callback) {
        socket.emit(event, payload, callback);
    } else {
        socket.emit(event, payload);
    }
}

export default socket;
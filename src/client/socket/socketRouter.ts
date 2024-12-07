import socket from "./socket";
import {getLogger} from "../../shared/config/LogConfig";

const log = getLogger("client.socket.socketRouter");
const logEvent = (event: string, payload: any) => {
    log.trace("[socket receive] event: ", event, payload);
};

type EventCallback = (data: any) => void;

interface EventHandlers {
    [eventName: string]: EventCallback;
}

const reactEventHandlers: EventHandlers = {};
const phaserEventHandlers: EventHandlers = {};

export function registerReactEvent(event: string, callback: EventCallback) {
    log.info("registerReactEvent", event);
    reactEventHandlers[event] = callback;
}

export function unregisterReactEvent(event: string) {
    reactEventHandlers[event] = null;
    delete reactEventHandlers[event];
}

export function registerPhaserEvent(event: string, callback: EventCallback) {
    log.info("registerPhaserEvent", event);
    phaserEventHandlers[event] = callback;
}

export function unregisterPhaserEvent(event: string) {
    phaserEventHandlers[event] = null;
    delete phaserEventHandlers[event];
}

socket.onAny((event, data) => {
    logEvent(event, data);
    if (phaserEventHandlers[event]) {
        phaserEventHandlers[event](data);
    } else if (reactEventHandlers[event]) {
        reactEventHandlers[event](data);
    } else {
        log.warn("unknown event:", event, data);
    }
});

export default socket;
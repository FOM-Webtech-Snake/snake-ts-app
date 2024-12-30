import socket from "./socket";
import {getLogger} from "../../shared/config/LogConfig";

const log = getLogger("client.socket.socketRouter");
const logEvent = (event: string, payload: any) => {
    log.trace("[socket receive] event: ", event, payload);
};

type EventCallback = (data: any) => void;

const reactEventHandlers: Map<string, EventCallback> = new Map();
const phaserEventHandlers: Map<string, EventCallback> = new Map();

export function registerReactEvent(event: string, callback: EventCallback) {
    log.debug("registerReactEvent", event);
    reactEventHandlers.set(event, callback);
}

export function unregisterReactEvent(event: string) {
    log.debug("unregisterReactEvent", event);
    reactEventHandlers.delete(event);
}

export function registerPhaserEvent(event: string, callback: EventCallback) {
    log.debug("registerPhaserEvent", event);
    phaserEventHandlers.set(event, callback);
}

export function unregisterPhaserEvent(event: string) {
    log.debug("unregisterPhaserEvent", event);
    phaserEventHandlers.delete(event);
}

socket.onAny((event, data) => {
    logEvent(event, data);
    const phaserEvent = phaserEventHandlers.get(event);
    const reactEvent = reactEventHandlers.get(event);
    if (!phaserEvent && !reactEvent) {
        log.warn("unknown event:", event, data);
    }

    if (phaserEvent) {
        phaserEvent(data);
    }
    if (reactEvent) {
        reactEvent(data);
    }
});

export default socket;
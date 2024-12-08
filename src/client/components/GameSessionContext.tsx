import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {GameSession} from "../../shared/model/GameSession";
import {getLogger} from "../../shared/config/LogConfig";
import {Player} from "../../shared/model/Player";
import {GameSessionConfig} from "../../shared/model/GameSessionConfig";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import socket from "../socket/socket";
import {registerReactEvent, unregisterReactEvent} from "../socket/socketRouter";


interface GameSessionContextType {
    session: GameSession;
    playerId: string;
    status: GameStateEnum;
    isConnected: boolean,
    createSession: (player: Player) => void;
    joinSession: (sessionId: string, player: Player) => void;
    leaveSession: () => void;
    updateConfig: (config: GameSessionConfig) => void;
}

const GameSessionContext = createContext<GameSessionContextType>({
    session: null,
    playerId: null,
    status: null,
    isConnected: false,
    createSession: () => {
    },
    joinSession: () => {
    },
    leaveSession: () => {
    },
    updateConfig: () => {
    }
});

interface SocketProviderProps {
    children: ReactNode;
}

const log = getLogger("client.components.GameSessionSocketProvider");

export const GameSessionProvider: React.FC<SocketProviderProps> = ({children}) => {
    const [session, setSession] = useState<GameSession>(null);
    const [status, setStatus] = useState<GameStateEnum>(null);

    const [playerId, setPlayerId] = useState<string | null>(socket.id);
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
            setPlayerId(socket.id);
        });
        socket.on("disconnect", () => {
            setIsConnected(false);
            setPlayerId(null);
        });
        // close/disconnect on unmount of this provider
        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);

    function updateGameSessionContext(gameSession: GameSession) {
        log.trace("updating game session context", gameSession);
        if (gameSession) {
            setSession(gameSession);
            setStatus(gameSession.getGameState());
        } else {
            setSession(null);
            setStatus(null);
        }
    }

    useEffect(() => {
        if (session) {
            registerReactEvent(SocketEvents.SessionState.CONFIG_UPDATED, (data: any) => {
                log.debug("received session config update", data);
                session.setConfig(GameSessionConfig.fromData(data));
                log.trace("session", session);
            });

            registerReactEvent(SocketEvents.GameControl.SYNC_GAME_STATE, function (data: any) {
                log.debug("sync session state");
                log.trace("session:", data.players);
                updateGameSessionContext(GameSession.fromData(data));
            });

            registerReactEvent(SocketEvents.SessionState.PLAYER_JOINED, (data: any) => {
                log.debug("received player join session", data);
                session.addPlayer(Player.fromData(data));
            });
        }

        return () => {
            unregisterReactEvent(SocketEvents.SessionState.CONFIG_UPDATED);
            unregisterReactEvent(SocketEvents.GameControl.SYNC_GAME_STATE);
            unregisterReactEvent(SocketEvents.SessionState.PLAYER_JOINED);
        };
    }, [session]);

    const createSession = (player: Player) => {
        if (!socket || session) return;
        socket.emit(SocketEvents.Connection.CREATE_SESSION, player.toJson(), (session: any) => {
            try {
                /* TODO show error to user */
                if (session.error) {
                    log.error(session.error);
                } else {
                    const gameSession = GameSession.fromData(session);
                    log.debug("received created game session", gameSession);
                    updateGameSessionContext(gameSession);
                }
            } catch (error) {
                log.error("failed to process created session data:", error);
            }
        });
    };

    const joinSession =
        (sessionId: string, player: Player) => {
            if (!socket || session) return;
            socket.emit(SocketEvents.Connection.JOIN_SESSION, sessionId, player.toJson(), (session: any) => {
                try {
                    /* TODO show error to user */
                    if (session.error) {
                        log.error(session.error);
                    } else {
                        const gameSession = GameSession.fromData(session);
                        log.debug("received joined game session", gameSession);
                        updateGameSessionContext(gameSession);
                    }
                } catch (error) {
                    log.error("failed to process joined session data:", error);
                }
            });
        };

    const updateConfig = (conf: GameSessionConfig) => {
        if (!socket || !session) return;
        socket.emit(SocketEvents.SessionState.CONFIG_UPDATED, conf.toJson());
    }


    const leaveSession = () => {
        if (!socket || !session) return;
        socket.emit(SocketEvents.Connection.LEAVE_SESSION);
        log.debug("left session");
        updateGameSessionContext(null);
    };

    return (
        <GameSessionContext.Provider
            value={{
                session,
                playerId,
                status,
                isConnected,
                createSession,
                joinSession,
                leaveSession,
                updateConfig
            }}>
            {children}
        </GameSessionContext.Provider>
    );
};

// hook for easier access
export const useGameSessionSocket = (): GameSessionContextType => {
    return useContext(GameSessionContext);
};
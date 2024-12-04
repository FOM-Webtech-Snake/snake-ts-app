import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {io, Socket} from "socket.io-client";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {GameSession} from "../../shared/model/GameSession";
import {getLogger} from "../../shared/config/LogConfig";
import {Player} from "../../shared/model/Player";
import {GameSessionConfig} from "../../shared/model/GameSessionConfig";
import customParser from "socket.io-msgpack-parser";


interface GameSessionSocketContextType {
    socket: Socket;
    session: GameSession;
    players: Player[];
    isConnected: boolean,
    createSession: (player: Player) => void;
    joinSession: (sessionId: string, player: Player) => void;
    leaveSession: () => void;
    updateConfig: (config: GameSessionConfig) => void;
}

const GameSessionSocketContext = createContext<GameSessionSocketContextType>({
    socket: null,
    session: null,
    players: null,
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

export const GameSessionSocketProvider: React.FC<SocketProviderProps> = ({children}) => {
    const [socket, setSocket] = useState<Socket>(null);
    const [session, setSession] = useState<GameSession>(null);
    const [players, setPlayers] = useState<Player[] | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const newSocket = io({parser: customParser});
        setSocket(newSocket);

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => {
            setIsConnected(false);
            setSession(null);
        };

        newSocket.on("connect", handleConnect);
        newSocket.on("disconnect", handleDisconnect);

        // close/disconnect on unmount of this provider
        return () => {
            newSocket.off("connect", handleConnect);
            newSocket.off("disconnect", handleDisconnect);
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (session) {
            socket.on(SocketEvents.SessionState.CONFIG_UPDATED, (data: any) => {
                log.debug("received session config update", data);
                session.setConfig(GameSessionConfig.fromData(data));
                log.trace("session", session);
            });

            socket.on(SocketEvents.GameControl.SYNC_GAME_STATE, function (data: any) {
                log.debug("sync session state");
                log.trace("session:", data.players);
                setSession(GameSession.fromData(data));
            });

            socket.on(SocketEvents.SessionState.PLAYER_JOINED, (data: any) => {
                log.debug("received player join session", data);
                session.addPlayer(Player.fromData(data));
                setPlayers(session.getPlayersAsArray());
            });
        }
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
                    setSession(gameSession);
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
                        setSession(gameSession);
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
        setSession(null);
        setPlayers(null);
    };

    const providerObj = useMemo(() => ({
        socket,
        session,
        players,
        isConnected,
        createSession,
        joinSession,
        leaveSession,
        updateConfig
    }), []);

    return (
        <GameSessionSocketContext.Provider
            value={providerObj}>
            {children}
        </GameSessionSocketContext.Provider>
    );
};

// hook for easier access
export const useGameSessionSocket = (): GameSessionSocketContextType => {
    return useContext(GameSessionSocketContext);
};
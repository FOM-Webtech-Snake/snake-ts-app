import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {GameSession} from "../../shared/GameSession";
import {getLogger} from "../../shared/config/LogConfig";


interface GameSessionSocketContextType {
    socket: Socket;
    session: GameSession;
    isConnected: boolean,
    createSession: (playerName: string) => void;
    joinSession: (sessionId: string, playerName: string) => void;
    leaveSession: () => void;
}

const GameSessionSocketContext = createContext<GameSessionSocketContextType>({
    socket: null,
    session: null,
    isConnected: false,
    createSession: () => {
    },
    joinSession: () => {
    },
    leaveSession: () => {
    }
});

interface SocketProviderProps {
    children: ReactNode;
}

export const GameSessionSocketProvider: React.FC<SocketProviderProps> = ({children}) => {
    const [socket, setSocket] = useState<Socket>(null);
    const [session, setSession] = useState<GameSession>(null);
    const [isConnected, setIsConnected] = useState(false);
    const log = getLogger("client.components.LobbyPage");

    useEffect(() => {
        const newSocket = io(); // TODO: add SocketURL as parameter
        setSocket(newSocket);

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => {
            setIsConnected(false);
            setSession(null);
        };

        newSocket.on("connect", handleConnect);
        newSocket.on("disconnect", handleDisconnect);
        newSocket.on(SocketEvents.SessionState.SESSION_UPDATED, (data: any) => {
            const gameSession = GameSession.fromData(data);
            log.debug("received game session update", gameSession);
            setSession(gameSession);
        });

        // close/disconnect on unmount of this provider
        return () => {
            newSocket.off("connect", handleConnect);
            newSocket.off("disconnect", handleDisconnect);
            newSocket.disconnect();
        };
    }, []);

    const createSession = (playerName: string) => {
        if (!socket || session) return;
        socket.emit(SocketEvents.Connection.CREATE_SESSION, playerName);
    };

    const joinSession =
        (sessionId: string, playerName: string) => {
            if (!socket || session) return;
            socket.emit(SocketEvents.Connection.JOIN_SESSION, sessionId, playerName);
        };

    const leaveSession = () => {
        if (!socket || !session) return;
        socket.emit(SocketEvents.Connection.LEAVE_SESSION);
        log.debug("left session");
        setSession(null);
    };

    return (
        <GameSessionSocketContext.Provider
            value={{socket, session, isConnected, createSession, joinSession, leaveSession}}>
            {children}
        </GameSessionSocketContext.Provider>
    );
};

// hook for easier access
export const useGameSessionSocket = (): GameSessionSocketContextType => {
    return useContext(GameSessionSocketContext);
};
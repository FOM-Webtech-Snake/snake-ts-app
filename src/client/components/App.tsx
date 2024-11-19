import React, {useState} from 'react';
import StartPage from './StartPage';
import LobbyPage from './LobbyPage';
import Footer from "./Footer";
import Header from "./Header";
import GamePage from "./GamePage";
import {io, Socket} from "socket.io-client";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {GameSession} from "../../shared/GameSession";
import {Player} from "../../shared/Player";

const App: React.FC = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [inLobby, setInLobby] = useState(false);
    const [player, setPlayer] = useState<Player>(null);
    const [gameSession, setGameSession] = useState<GameSession>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);


    const handleStart = (playerName: string) => {
        const newSocket = io();
        // Wait for the 'connect' event
        newSocket.on(SocketEvents.Connection.CONNECT, () => {
            console.log("Socket connected:", newSocket.id);
            setSocket(newSocket); // Set the connected socket

            const newPlayer = new Player(newSocket.id, playerName);
            setPlayer(newPlayer)

            setInLobby(true); // Transition to the lobby
            setIsConnecting(false); // Hide "waiting" overlay
        });

        newSocket.on(SocketEvents.Connection.CONNECT_ERROR, (error) => {
            console.error("Socket connection error:", error);
            setIsConnecting(false); // Hide "waiting" overlay
        });
    };

    const handleJoinGame = (gameSession: GameSession) => {
        setGameSession(gameSession);
        if (socket) {
            socket.emit(SocketEvents.Connection.JOIN_SESSION, gameSession.getId());
            console.log("joined socket session", gameSession.getId());
        }
    };

    const handleGameStart = () => {
        setGameStarted(true);
    };

    return (
        <div className="d-flex flex-column vh-100 bg-dark text-white">

            {/* TODO extract to component */}
            {isConnecting && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="spinner-border text-white mb-3" role="status">
                            <span className="visually-hidden">Connecting...</span>
                        </div>
                        <p>Connecting...</p>
                    </div>
                </div>
            )}


            <Header playerId={socket?.id} playerName={player?.getName()} sessionId={gameSession?.getId()}/>
            {gameStarted ? ( // when game was started -> show the game
                <GamePage socket={socket!}/>
            ) : inLobby ? ( // when in lobby, but game not started -> show lobby
                <LobbyPage socket={socket!}
                           player={player!}
                           onJoinGame={handleJoinGame}
                           onGameStart={handleGameStart}/>
            ) : (
                <StartPage onStart={handleStart}/>
            )}
            <Footer/>
        </div>
    );
};

export default App;
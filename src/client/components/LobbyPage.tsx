import React, {useEffect, useRef, useState} from 'react';
import {GameSession} from "../../shared/GameSession";
import {Socket} from "socket.io-client";
import {Player} from "../../shared/Player";

interface LobbyPageProps {
    socket: Socket;
    player: Player;
    onJoinGame: (gameSession: GameSession) => void;
    onLeaveGame: () => void;
    onGameStart: () => void;
}

const LobbyPage: React.FC<LobbyPageProps> = ({socket, player, onJoinGame, onLeaveGame, onGameStart}) => {
    const [sessionId, setSessionId] = useState("");
    const [gameSession, setGameSession] = useState<GameSession>(null);

    // TODO use later when there is a lobby (show player, waiting for players etc.)
    //  const [gameSession, setGameSession] = useState<GameSession>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = async () => {
        try {
            let response;
            if (sessionId.trim()) {
                response = await fetch(`/api/lobby/join`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        sessionId: sessionId,
                        playerId: player.getId(),
                        playerName: player.getName()
                    })
                });
            } else {
                response = await fetch(`/api/lobby/create`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        playerId: player.getId(),
                        playerName: player.getName()
                    })
                });
            }

            if (!response?.ok) {
                throw new Error('Failed to join session');
            }

            const data = await response.json();
            const session = GameSession.fromData(data)
            console.info("parsed game session", session);

            setGameSession(session);
            onJoinGame(session); // Auto join newly created session
        } catch (error) {
            alert(`Error: ${(error as Error).message}`);
        }

    };

    const handleLeaveSession = () => {
        setSessionId("");
        setGameSession(null);
        onLeaveGame();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleButtonClick();
        }
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white">
            <h1 className="mb-4">Welcome to the Lobby, {player.getName()}!</h1>
            <div className="input-container text-center mb-3">
                {gameSession ? (
                    <div className="input-group">
                        <span className="input-group-text">Session ID: {gameSession?.getId()}</span>
                        <button
                            className="btn btn-danger btn-lg ml-2"
                            onClick={handleLeaveSession}>
                            <i className="fa fa-sign-out"></i>
                        </button>
                    </div>
                ) : (
                    <div className="input-group">
                        <span className="input-group-text">Session ID</span>
                        <div className="form-floating">
                            <input
                                type="text"
                                id="sessionCode"
                                className="form-control"
                                placeholder="Session Code"
                                value={sessionId ? sessionId : ""}
                                onChange={(e) => setSessionId(e.target.value)}
                                onKeyDown={handleKeyDown}
                                ref={inputRef}
                                style={{maxWidth: '300px'}}
                            />
                            <label htmlFor="sessionCode">Session Code</label>
                        </div>


                        {sessionId.trim() && !gameSession ? (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleButtonClick}>
                                <i className="fa fa-right-to-bracket"/>
                            </button>
                        ) : (
                            <button
                                className="btn btn-secondary btn-lg"
                                onClick={handleButtonClick}>
                                <i className="fa fa-plus"/>
                            </button>
                        )}
                    </div>
                )}
            </div>
            {gameSession ? (
                <button
                    className="btn btn-success btn-lg mt-3"
                    onClick={onGameStart}>
                    Start Game
                </button>) : ""}
        </div>
    );
};

export default LobbyPage;
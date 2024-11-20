import React, {useEffect, useRef, useState} from 'react';
import {GameSession} from "../../shared/GameSession";
import {Socket} from "socket.io-client";
import {Player} from "../../shared/Player";
import {Button, Col, Container, Row} from 'react-bootstrap';
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {getLogger} from "../../shared/config/LogConfig";

interface LobbyPageProps {
    socket: Socket;
    player: Player;
    onJoinGame: (gameSession: GameSession) => void;
    onLeaveGame: () => void;
    onGameStart: () => void;
}

const log = getLogger("client.components.LobbyPage");

const LobbyPage: React.FC<LobbyPageProps> = ({socket, player, onJoinGame, onLeaveGame, onGameStart}) => {
    const [sessionId, setSessionId] = useState("");
    const [gameSession, setGameSession] = useState<GameSession>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (socket) {
            socket.on(SocketEvents.GameControl.START_GAME, () => {
                log.debug("Game started by host");
                onGameStart();
            });
        }
    }, []);

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
            onJoinGame(session); // automatically join newly created session
            setCurrentStep(2);
        } catch (error) {
            alert(`Error: ${(error as Error).message}`);
        }
    };

    const handleLeaveSession = () => {
        setSessionId("");
        setGameSession(null);
        onLeaveGame();
        setCurrentStep(1); // Move back to the first step
    };

    const startGame = () => {
        if (socket) {
            socket.emit(SocketEvents.GameControl.START_GAME);
        }
    }

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
        <Container className={"vh-100 d-flex flex-column bg-dark text-white justify-content-center align-items-center"}>
            <Row className="w-100 mb-4">
                <Col>
                    <h1 className="text-center">Welcome to the Lobby, {player.getName()}!</h1>
                </Col>
            </Row>
            <Row className="w-100">
                <Col className="d-flex justify-content-center">
                    {currentStep === 1 ? (
                        <div className="input-container text-center mb-3">
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
                                    <Button
                                        className="btn btn-primary btn-lg"
                                        onClick={handleButtonClick}>
                                        <i className="fa fa-right-to-bracket"/>
                                    </Button>
                                ) : (
                                    <Button
                                        className="btn btn-secondary btn-lg"
                                        onClick={handleButtonClick}>
                                        <i className="fa fa-plus"/>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="input-container text-center mb-3">
                            <div className="input-group">
                                <span className="input-group-text">Session ID: {gameSession?.getId()}</span>
                                <Button
                                    className="btn btn-danger btn-lg ml-2"
                                    onClick={handleLeaveSession}>
                                    <i className="fa fa-sign-out"></i>
                                </Button>
                            </div>
                            {/* check if the curren user is the owner -> show start button when true */}
                            {(gameSession?.getOwnerId() === player.getId()) ? (
                                <Button
                                    className="btn btn-success btn-lg mt-3"
                                    onClick={startGame}>
                                    Start Game
                                </Button>
                            ) : (
                                <div className="text-center mt-3">
                                    <p>Waiting for the host to start the game</p>
                                </div>
                            )}

                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default LobbyPage;
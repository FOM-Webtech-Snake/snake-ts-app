import React, {useEffect, useRef, useState} from 'react';
import {Player} from "../../shared/Player";
import {Button, Col, Container, Row} from 'react-bootstrap';
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionSocketContext";
import PlayerList from "./PlayerList";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import GameSessionConfigModal from "./GameSessionConfigModal";

interface LobbyPageProps {
    player: Player;
    onGameReady: () => void;
}

const log = getLogger("client.components.LobbyPage");

const LobbyPage: React.FC<LobbyPageProps> = ({player, onGameReady}) => {
    const {socket, session, joinSession, createSession, leaveSession} = useGameSessionSocket();
    const [sessionId, setSessionId] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (socket) {
            socket.once(SocketEvents.GameControl.GET_READY, (callback: any) => {
                log.debug("Getting ready, triggered by host");
                onGameReady();
                callback(); // ack the server when ready
            });
        }
    }, [socket]);

    useEffect(() => {
        if (session) {
            setCurrentStep(2);
        } else {
            setCurrentStep(1);
        }
    }, [session]);


    const createJoinSession = async () => {
        try {
            if (sessionId.trim()) {
                joinSession(sessionId.trim(), player);
            } else {
                createSession(player);
            }
        } catch (error) {
            log.error(`Error: ${(error as Error).message}`);
        }
    };

    const showConfigModal = ()=>{
        setShowCreateSessionModal(true);
    }

    const handleLeaveSession = () => {
        leaveSession();
    };

    const startGame = () => {
        if (socket) {
            socket.emit(SocketEvents.GameControl.GET_READY);
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            createJoinSession();
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

                                {sessionId.trim() && !session ? (
                                    <Button
                                        className="btn btn-primary btn-lg"
                                        onClick={createJoinSession}>
                                        <i className="fa fa-right-to-bracket"/>
                                    </Button>
                                ) : (
                                    <Button
                                        className="btn btn-secondary btn-lg"
                                        onClick={createJoinSession}>
                                        <i className="fa fa-plus"/>
                                    </Button>
                                )}

                                <Button
                                    className="btn btn-primary btn-lg"
                                    onClick={showConfigModal}>
                                    <i className="fa fa-right-to-bracket"/>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="input-container text-center mb-3">
                            <div className="input-group">
                                <span className="input-group-text">Session ID: {session?.getId()}</span>
                                <Button
                                    className="btn btn-danger btn-lg ml-2"
                                    onClick={handleLeaveSession}>
                                    <i className="fa fa-sign-out"></i>
                                </Button>
                            </div>
                            {/* check if the curren user is the owner -> show start button when true */}
                            {(session?.getPlayer(socket.id).getRole() === PlayerRoleEnum.HOST) ? (
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
            {session && (<PlayerList/>)}

            <GameSessionConfigModal
                show={showCreateSessionModal}
                onClose={() => setShowCreateSessionModal(false)}
                onCreate={() => {}}
            />
        </Container>
    );
};

export default LobbyPage;
import React, {useEffect, useRef, useState} from 'react';
import {Player} from "../../shared/model/Player";
import {Button, Col, Container, Row} from 'react-bootstrap';
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionSocketContext";
import PlayerList from "./PlayerList";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import logo from '/public/assets/logo.svg';

interface LobbyPageProps {
    player: Player;
    onGameReady: () => void;
}

const log = getLogger("client.components.LobbyPage");



const LobbyPage: React.FC<LobbyPageProps> = ({player, onGameReady}) => {
    const {socket, session, joinSession, createSession, leaveSession} = useGameSessionSocket();
    const [sessionId, setSessionId] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
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

        <Container
            className="d-flex flex-column justify-content-center align-items-center vh-100"
            style={{
                backgroundImage: `url(${logo})`,
                backgroundSize: "cover", // Hintergrund proportional abdecken
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "100vw",
                height: "100vh",
            }}
        >
            {/* Überschrift über dem Logo */}
            <div className="text-center" style={{ marginTop: "250px" }}>
                <h1 className="text-white">Welcome to the Lobby, {player.getName()}!</h1>
            </div>

            <div className="text-center" style={{ maxWidth: "600px" }}>
                {currentStep === 1 ? (
                    <div className="mb-3">
                        <div className="d-flex justify-content-center mb-3" style={{ maxWidth: "600px", width: "500px" }}>
                            <div className="input-group w-75">
                                <span className="input-group-text" style={{ width: "150px" }}>Session ID</span>
                                <input
                                    type="text"
                                    id="sessionCode"
                                    className="form-control"
                                    placeholder="Session Code"
                                    value={sessionId || ""}
                                    onChange={(e) => setSessionId(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    ref={inputRef}
                                />
                            </div>
                        </div>

                        {/* Button Container */}
                        <div className="d-flex justify-content-center">
                            {sessionId.trim() && !session ? (
                                <Button
                                    className="btn btn-primary btn-lg mx-2"
                                    onClick={createJoinSession}
                                >
                                    <i className="fa fa-right-to-bracket" />
                                </Button>
                            ) : (
                                <Button
                                    className="btn btn-secondary btn-lg mx-2"
                                    onClick={createJoinSession}
                                >
                                    <i className="fa fa-plus" />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="input-group mb-3">
                    <span className="input-group-text">
                        Session ID: {session?.getId()}
                    </span>
                            <Row>
                                <Col className="text-center">
                                    <button
                                        className="btn btn-success"
                                        onClick={leaveSession}
                                    >
                                        Zurück
                                    </button>
                                </Col>
                            </Row>

                        </div>
                        {session?.getPlayer(socket.id).getRole() === PlayerRoleEnum.HOST ? (
                            <Row>
                                <Col className="text-center">
                                    <button className="button" data-text="Awesome"
                                            onClick={leaveSession}>
                                        <span className="actual-text">&nbsp;Start&nbsp;</span>
                                        <span aria-hidden="true" className="hover-text">&nbsp;Start&nbsp;</span>
                                    </button>
                                </Col>
                            </Row>
                        ) : (
                            <p>Waiting for the host to start the game</p>
                        )}
                    </div>
                )}
            </div>

            {session && <PlayerList />}
        </Container>
    );
};

export default LobbyPage;
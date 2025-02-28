import React, {useEffect, useRef, useState} from 'react';
import {Player} from "../../shared/model/Player";
import {Button, Card, Col, Container, Form, InputGroup, Row} from 'react-bootstrap';
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "../components/GameSessionContext";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import GameSessionConfigModal from "../components/GameSessionConfigModal";
import {GameSessionConfig} from "../../shared/model/GameSessionConfig";
import PlayerList from "../components/PlayerList";
import ShareModal from "../components/ShareModal";
import {registerReactEvent} from "../socket/socketRouter";
import socket from "../socket/socket";
import GameSessionError from "../components/GameSessionError";
import {ColorUtil} from "../game/util/ColorUtil";
import DeathmatchLogo from '../../../public/assets/deathmatch.png';
import EnduranceLogo from '../../../public/assets/endurance.png';

interface LobbyPageProps {
    player: Player;
    onGameReady: () => void;
}

const log = getLogger("client.components.LobbyPage");

const LobbyPage: React.FC<LobbyPageProps> = ({player, onGameReady}) => {
    const {session, joinSession, createSession, leaveSession, updateConfig, setError} = useGameSessionSocket();
    const [sessionId, setSessionId] = useState("");
    const [showShareModal, setShowShareModal] = useState(false);
    const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [gameMode, setGameMode] = useState('Deathmatch');

    const [color, setColor] = useState<string>(() => {
        return localStorage.getItem("color") || ColorUtil.getRandomColorRGB();
    });

    const handleShowShareModal = () => setShowShareModal(true);
    const handleCloseShareModal = () => setShowShareModal(false);

    useEffect(() => {
        if (socket && session) {
            setSessionId(session.getId());
            inputRef.current.readOnly = true;

            registerReactEvent(SocketEvents.GameControl.GET_READY, (callback: any) => {
                log.debug("Getting ready, triggered by host");
                onGameReady();
                callback(); // ack the server when ready
            });
            setGameMode(session.getConfig().getRespawnAfterDeathEnabled() ? 'Endurance' : 'Deathmatch');
        } else {
            inputRef.current.readOnly = false;
        }
    }, [socket, session]);

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

    const showConfigModal = () => {
        setShowCreateSessionModal(true);
    }

    const handleLeaveSession = () => {
        leaveSession();
    };

    const startGame = () => {
        if (gameMode === "Deathmatch" && session.getPlayerCount() < 2) {
            setError("Deathmatch erfordert mind. 2 Spieler!");
            return;
        }
        if (socket) {
            socket.emit(SocketEvents.GameControl.GET_READY);
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            createJoinSession();
        }
    };

    const handleGameModeClick = (mode) => {
        if (session?.getPlayer(socket.id)?.getRole() === PlayerRoleEnum.HOST) {
            const oldConfig = session.getConfig();
            const config = new GameSessionConfig(
                oldConfig.getMaxPlayers(),
                oldConfig.getSize(),
                oldConfig.getGameDuration(),
                oldConfig.getWorldCollisionEnabled(),
                oldConfig.getSelfCollisionEnabled(),
                oldConfig.getPlayerToPlayerCollisionEnabled(),
                mode === 'Endurance',
                oldConfig.getRespawnTimer(),
                oldConfig.getObstacleEnabled(),
                oldConfig.getSnakeStartingLength(),
                oldConfig.getSnakeStartingSpeed(),
                oldConfig.getSnakeStartingScale(),
            )

            updateConfig(config);
            setGameMode(mode);
        } else {
            log.debug("player not host!");
        }
    };

    const handleColorChange = (newColor) => {
        log.debug("new color:", newColor);

        setColor(newColor);
        player.setColor(newColor);
        localStorage.setItem("color", newColor);

        socket.emit(SocketEvents.SessionEvents.PLAYER_COLOR_CHANGED, newColor.toString());
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <>
            <Container className="vh-100 d-flex justify-content-center">
                <div>
                    <Row>
                        <Col className="col-12 mt-4">
                            <h1 className="text-center" style={{color: "#ffffff"}}>Hello {player.getName()}!</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="col-12">
                            <Card className="p-4 shadow">
                                <Card.Header className="text-center">
                                    <h5>Session</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div>
                                        <Form.Group controlId="sessionId" className="mb-3">
                                            <Form.Label>Session ID</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text id="sessionIdAddon">
                                                    <i className="fas fa-qrcode"></i>
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="text"
                                                    aria-label="Session ID"
                                                    aria-describedby="sessionIdAddon"
                                                    placeholder="Session ID"
                                                    value={sessionId}
                                                    onChange={(e) => setSessionId(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    ref={inputRef}
                                                />
                                                {session ? (<>
                                                    <Button
                                                        variant="secondary" size="lg"
                                                        onClick={() => document.getElementById('colorPickerInput').click()}
                                                        style={{borderRight: "1px solid #dee2e6"}}
                                                    >
                                                        {color && (
                                                            <div style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                backgroundColor: color,
                                                                borderRadius: '50%',
                                                                border: '1px solid #ffffff',
                                                            }}></div>
                                                        )}
                                                    </Button>
                                                    {/*hidden color picker*/}
                                                    <input
                                                        id="colorPickerInput"
                                                        type="color"
                                                        value={color}
                                                        onChange={(e) => handleColorChange(e.target.value)}
                                                        style={{display: 'none'}}
                                                    />
                                                    <Button
                                                        variant="secondary" size="lg"
                                                        onClick={handleShowShareModal}
                                                        style={{
                                                            borderLeft: "1px solid #dee2e6",
                                                            borderRight: "1px solid #dee2e6",
                                                        }}>
                                                        <i className="fa fa-share"></i>
                                                    </Button>
                                                    <Button
                                                        variant="danger" size="lg"
                                                        onClick={handleLeaveSession}
                                                        style={{borderLeft: "1px solid #dee2e6"}}>
                                                        <i className="fa fa-sign-out"></i>
                                                    </Button>
                                                </>) : (
                                                    <>
                                                        {sessionId.trim() ? (
                                                            <Button
                                                                variant="primary" size="lg"
                                                                onClick={createJoinSession}>
                                                                <i className="fa fa-right-to-bracket"/>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="secondary" size="lg"
                                                                onClick={createJoinSession}>
                                                                <i className="fa fa-plus"/>
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                            </InputGroup>
                                        </Form.Group>
                                        {session && (
                                            <div className="d-grid">
                                                {(session?.getPlayer(socket.id)?.getRole() === PlayerRoleEnum.HOST) ? (
                                                    <div className="d-flex justify-content-center align-items-center">
                                                        <Button
                                                            className="button" onClick={startGame}>
                                                            <span className="actual-text">Start Game</span>
                                                        </Button>

                                                        <Button
                                                            className="btn btn-secondary btn-lg m-3"
                                                            onClick={showConfigModal}>
                                                            <i className="fa fa-gear"/>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <p className="d-flex justify-content-center align-items-center">
                                                        Waiting for the host to start the game
                                                    </p>
                                                )}
                                                <InputGroup className="mb-3 justify-content-space-evenly mt-3">
                                                    <div className="d-flex" style={{
                                                        justifyContent: "space-evenly",
                                                        alignItems: "center",
                                                        width: "100%",
                                                    }}>
                                                        {/*Button Deathmatch*/}
                                                        <Button
                                                            variant={gameMode === 'Deathmatch' ? 'primary' : 'outline-primary'}
                                                            onClick={() => handleGameModeClick('Deathmatch')}
                                                            style={{
                                                                height: "100px",
                                                                width: "100px",
                                                                backgroundImage: `url(${DeathmatchLogo})`,
                                                                backgroundSize: "contain",
                                                                backgroundPosition: "center",
                                                                backgroundRepeat: "no-repeat",
                                                                filter: gameMode === 'Deathmatch' ? 'none' : 'grayscale(100%)',
                                                            }}
                                                            title="Deathmatch"
                                                        >
                                                        </Button>
                                                        {/*Button Endurance*/}
                                                        <Button
                                                            variant={gameMode === 'Endurance' ? 'primary' : 'outline-primary'}
                                                            onClick={() => handleGameModeClick('Endurance')}
                                                            style={{
                                                                height: "100px",
                                                                width: "100px",
                                                                backgroundImage: `url(${EnduranceLogo})`,
                                                                backgroundSize: "contain",
                                                                backgroundPosition: "center",
                                                                backgroundRepeat: "no-repeat",
                                                                filter: gameMode === 'Endurance' ? 'none' : 'grayscale(100%)',
                                                            }}
                                                            title="Endurance"
                                                        >
                                                        </Button>
                                                    </div>
                                                </InputGroup>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {session && (

                        <Row>
                            <Col className="col-12">
                                <PlayerList desktopViewOnly={true}/>
                            </Col>
                        </Row>
                    )}
                    <GameSessionError/>
                </div>
            </Container>

            <ShareModal
                show={showShareModal}
                onClose={handleCloseShareModal}
                sessionId={sessionId}
            />

            <GameSessionConfigModal
                show={showCreateSessionModal}
                onClose={() => setShowCreateSessionModal(false)}
                onSave={(config: GameSessionConfig) => {
                    updateConfig(config);
                    setShowCreateSessionModal(false);
                }}
            />
        </>
    );
};

export default LobbyPage;
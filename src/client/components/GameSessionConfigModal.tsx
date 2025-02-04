import React, {useEffect, useState} from 'react';
import {Button, Col, Form, Modal, Row} from 'react-bootstrap';

import {Size} from "../../shared/model/Size";
import {
    DEFAULT_GAME_SESSION_CONFIG,
    GameSessionConfig,
    SNAKE_STARTING_LENGTH,
    SNAKE_STARTING_SCALE,
    SNAKE_STARTING_SPEED
} from "../../shared/model/GameSessionConfig";
import {useTheme} from "./ThemeProvider";
import {useGameSessionSocket} from "./GameSessionContext";


interface SessionOptionsModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (config: GameSessionConfig) => void;
}

const GameSessionConfigModal: React.FC<SessionOptionsModalProps> = ({show, onClose, onSave}) => {
    const {theme} = useTheme();
    const {session} = useGameSessionSocket();
    const [maxPlayers, setMaxPlayers] = useState(
        session ? session.getConfig().getMaxPlayers()
            : DEFAULT_GAME_SESSION_CONFIG.getMaxPlayers());
    const [worldSize, setWorldSize] = useState(
        session ? session.getConfig().getSize()
            : DEFAULT_GAME_SESSION_CONFIG.getSize());
    const [gameDuration, setGameDuration] = useState(
        session ? session.getConfig().getGameDuration()
            : DEFAULT_GAME_SESSION_CONFIG.getGameDuration());
    const [worldCollisionEnabled, setWorldCollisionEnabled] = useState(
        session ? session.getConfig().getWorldCollisionEnabled()
            : DEFAULT_GAME_SESSION_CONFIG.getWorldCollisionEnabled());
    const [selfCollisionEnabled, setSelfCollisionEnabled] = useState(
        session ? session.getConfig().getSelfCollisionEnabled()
            : DEFAULT_GAME_SESSION_CONFIG.getSelfCollisionEnabled());
    const [playerToPlayerCollisionEnabled, setPlayerToPlayerCollisionEnabled] = useState(
        session ? session.getConfig().getPlayerToPlayerCollisionEnabled()
            : DEFAULT_GAME_SESSION_CONFIG.getPlayerToPlayerCollisionEnabled());
    const [respawnAfterDeathEnabled, setRespawnAfterDeathEnabled] = useState(
        session ? session.getConfig().getRespawnAfterDeathEnabled()
            : DEFAULT_GAME_SESSION_CONFIG.getRespawnAfterDeathEnabled());
    const [respawnTimer, setRespawnTimer] = useState(
        session ? session.getConfig().getRespawnTimer()
            : DEFAULT_GAME_SESSION_CONFIG.getRespawnTimer());
    const [obstaclesEnabled, setObstaclesEnabled] = useState(
        session ? session.getConfig().getObstacleEnabled()
            : DEFAULT_GAME_SESSION_CONFIG.getObstacleEnabled());

    /* snake option parameters */
    const [startingLength, setStartingLength] = useState(
        session ? session.getConfig().getSnakeStartingLength()
            : DEFAULT_GAME_SESSION_CONFIG.getSnakeStartingLength());
    const [startingSpeed, setStartingSpeed] = useState(
        session ? session.getConfig().getSnakeStartingSpeed()
            : DEFAULT_GAME_SESSION_CONFIG.getSnakeStartingSpeed());
    const [startingScale, setStartingScale] = useState(
        session ? session.getConfig().getSnakeStartingScale()
            : DEFAULT_GAME_SESSION_CONFIG.getSnakeStartingScale());

    useEffect(() => {
        if (session) {
            const config = session.getConfig();
            // update respawnAfterDeath on game mode change
            setRespawnAfterDeathEnabled(config.getRespawnAfterDeathEnabled());
        }
    }, [session]);

    const handleSave = () => {
        const config = new GameSessionConfig(
            maxPlayers,
            worldSize,
            gameDuration,
            worldCollisionEnabled,
            selfCollisionEnabled,
            playerToPlayerCollisionEnabled,
            respawnAfterDeathEnabled,
            respawnTimer,
            obstaclesEnabled,
            startingLength,
            startingSpeed,
            startingScale,
        );
        onSave(config);
    };

    const handleSizeChange = (dimension: "height" | "width", value: number) => {
        const newSize = new Size(
            dimension === "height" ? value : worldSize.getHeight(),
            dimension === "width" ? value : worldSize.getWidth()
        );
        setWorldSize(newSize);
    };

    return (
        <Modal className={`modal ${theme}`} show={show} onHide={onClose} centered backdrop="static">
            <Modal.Header
                closeButton>
                <Modal.Title>Configure your Session</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="maxPlayers">
                        <Form.Label>Max Players</Form.Label>
                        <Form.Control
                            type="number"
                            min={2}
                            max={100}
                            value={maxPlayers}
                            onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
                        />
                    </Form.Group>
                    <Form.Group controlId="worldSize">
                        <Form.Label>World Size (Height x Width)</Form.Label>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="number"
                                    placeholder="Height"
                                    value={worldSize.getHeight()}
                                    onChange={(e) =>
                                        handleSizeChange("height", parseInt(e.target.value, 10))
                                    }
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="number"
                                    placeholder="Width"
                                    value={worldSize.getWidth()}
                                    onChange={(e) =>
                                        handleSizeChange("width", parseInt(e.target.value, 10))
                                    }
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group controlId="gameDuration">
                        <Row>
                            <Col>
                                <Form.Label>Spieldauer (in Sekunden)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={20}
                                    max={10000}
                                    value={gameDuration}
                                    onChange={(e) => setGameDuration(parseInt(e.target.value, 10))}
                                />
                            </Col>
                            <Col>
                                <Form.Label>Respawn Timer (in Sekunden)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={respawnTimer / 1000}
                                    onChange={(e) => setRespawnTimer(parseInt(e.target.value, 10) * 1000)}
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Check
                        type="switch"
                        id="worldCollision"
                        label="Enable World Collision"
                        checked={worldCollisionEnabled}
                        onChange={(e) => setWorldCollisionEnabled(e.target.checked)}
                    />
                    <Form.Check
                        type="switch"
                        id="playerToPlayerCollision"
                        label="Enable Player-to-Player Collision"
                        checked={playerToPlayerCollisionEnabled}
                        onChange={(e) => setPlayerToPlayerCollisionEnabled(e.target.checked)}
                    />
                    <Form.Check
                        type="switch"
                        id="selfCollision"
                        label="Enable Self Collision"
                        checked={selfCollisionEnabled}
                        onChange={(e) => setSelfCollisionEnabled(e.target.checked)}
                    />
                    <Form.Check
                        type="switch"
                        id="respawn"
                        label="Enable respawn after death"
                        checked={respawnAfterDeathEnabled}
                        onChange={(e) => setRespawnAfterDeathEnabled(e.target.checked)}
                    />
                    <Form.Check
                        type="switch"
                        id="obstacles"
                        label="Enable Obstacles"
                        checked={obstaclesEnabled}
                        onChange={(e) => setObstaclesEnabled(e.target.checked)}
                    />

                    <Form.Group controlId="startingLength">
                        <Form.Label>Snake Starting Length: {startingLength}</Form.Label>
                        <Form.Range
                            min={SNAKE_STARTING_LENGTH.min}
                            max={SNAKE_STARTING_LENGTH.max}
                            step={1}
                            value={startingLength}
                            onChange={(e) => setStartingLength(parseInt(e.target.value, 10))}
                        />
                    </Form.Group>
                    <Form.Group controlId="startingSpeed">
                        <Form.Label>Snake Starting Speed: {startingSpeed}</Form.Label>
                        <Form.Range
                            min={SNAKE_STARTING_SPEED.min}
                            max={SNAKE_STARTING_SPEED.max}
                            step={25}
                            value={startingSpeed}
                            onChange={(e) => setStartingSpeed(parseFloat(e.target.value))}
                        />
                    </Form.Group>
                    <Form.Group controlId="startingScale">
                        <Form.Label>Snake Starting Scale: {startingScale}</Form.Label>
                        <Form.Range
                            min={SNAKE_STARTING_SCALE.min}
                            max={SNAKE_STARTING_SCALE.max}
                            step={0.05}
                            value={startingScale}
                            onChange={(e) => setStartingScale(parseFloat(e.target.value))}
                        />
                    </Form.Group>

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GameSessionConfigModal;
import React, {useState} from 'react';
import {Button, Col, Form, Modal, Row} from 'react-bootstrap';

import {Size} from "../../shared/model/Size";
import {DEFAULT_GAME_SESSION_CONFIG, GameSessionConfig} from "../../shared/model/GameSessionConfig";


interface SessionOptionsModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (config: GameSessionConfig) => void;
}

const GameSessionConfigModal: React.FC<SessionOptionsModalProps> = ({show, onClose, onSave}) => {
    const [maxPlayers, setMaxPlayers] = useState(DEFAULT_GAME_SESSION_CONFIG.getMaxPlayers());
    const [worldSize, setWorldSize] = useState(DEFAULT_GAME_SESSION_CONFIG.getSize());
    const [worldCollisionEnabled, setWorldCollisionEnabled] = useState(DEFAULT_GAME_SESSION_CONFIG.getWorldCollisionEnabled());
    const [selfCollisionEnabled, setSelfCollisionEnabled] = useState(DEFAULT_GAME_SESSION_CONFIG.getSelfCollisionEnabled());
    const [playerToPlayerCollisionEnabled, setPlayerToPlayerCollisionEnabled] = useState(DEFAULT_GAME_SESSION_CONFIG.getPlayerToPlayerCollisionEnabled());

    /* snake option parameters */
    const [startingLength, setStartingLength] = useState(DEFAULT_GAME_SESSION_CONFIG.getSnakeStartingLength());
    const [startingSpeed, setStartingSpeed] = useState(DEFAULT_GAME_SESSION_CONFIG.getSnakeStartingSpeed());
    const [startingScale, setStartingScale] = useState(DEFAULT_GAME_SESSION_CONFIG.getSnakeStartingScale());

    const handleSave = () => {
        const config = new GameSessionConfig(
            maxPlayers,
            worldSize,
            worldCollisionEnabled,
            selfCollisionEnabled,
            playerToPlayerCollisionEnabled,
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
        <Modal show={show} onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton>
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
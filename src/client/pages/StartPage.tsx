import React, {useEffect, useRef, useState} from "react";
import {ColorUtil} from "../game/util/ColorUtil";
import {Button, Card, Col, Container, Form, InputGroup, Row} from "react-bootstrap";

interface StartPageProps {
    onStart: (playerName: string, color: string, sessionId: string) => void;
}

const StartPage: React.FC<StartPageProps> = ({onStart}) => {
    const [playerName, setPlayerName] = useState(() => {
        return localStorage.getItem("playerName") || "";
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const [color, setColor] = useState<string>(() => {
        return localStorage.getItem("color") || ColorUtil.getRandomColorRGB();
    });
    const [sessionId, setSessionId] = useState<string>("");
    const [isValidName, setIsValidName] = useState<boolean>(/^[a-zA-Z0-9]*$/.test(playerName) || false);

    const handleStart = () => {
        if (!isValidName) {
            return;
        }
        if (inputRef.current) {
            if (!inputRef.current.reportValidity()) {
                return;
            }
            onStart(playerName, color, sessionId);
        }
    };

    const removeSessionId = () => {
        setSessionId("");

        // remove the sessionId parameter from the URL
        const url = new URL(window.location.href);
        url.searchParams.delete("sessionId");
        window.history.replaceState(null, "", url.toString());
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleStart();
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value.trim();
        setPlayerName(value);

        // validation of the name
        const isValid = /^[a-zA-Z0-9]*$/.test(value);
        setIsValidName(isValid);
    };

    useEffect(() => {
        localStorage.setItem("playerName", playerName);
    }, [playerName]);

    useEffect(() => {
        localStorage.setItem("color", color);
    }, [color]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }

        const params = new URLSearchParams(window.location.search);
        const sessionIdFromUrl = params.get("sessionId");
        if (sessionIdFromUrl) {
            setSessionId(sessionIdFromUrl);
        }
    }, []);

    return (

        <Container className="vh-100 d-flex justify-content-center">
            <div>
                <Row>
                    <Col className="col-12 text-center mt-4">
                        <h1 style={{color: "#ffffff"}}>Welcome to Snake Extreme!</h1>
                    </Col>
                </Row>
                <Row>
                    <Col className="col-12">
                        <Card className="p-4 shadow">
                            <Card.Header className="text-center">
                                <h5>Player</h5>
                            </Card.Header>
                            <Card.Body>
                                {sessionId && (
                                    <Card.Text className="text-center">
                                        <strong>Joining Session:</strong> {sessionId}
                                        <Button
                                            variant="outline-secondary"
                                            onClick={removeSessionId}
                                            className="ms-2">
                                            <i className="fa fa-trash-alt"></i>
                                        </Button>
                                    </Card.Text>
                                )}
                                <div>
                                    <Form.Group controlId="playerName" className="mb-3">
                                        <Form.Label>Player Name</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text id="playerNameAddon">
                                                <i className="fa fa-user"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                aria-label="Player Name"
                                                aria-describedby="playerNameAddon"
                                                placeholder="Enter your name"
                                                value={playerName}
                                                required={true}
                                                onChange={handleInputChange}
                                                onKeyDown={handleKeyDown}
                                                ref={inputRef}
                                            />
                                        </InputGroup>
                                        {!isValidName &&
                                            <div className="text-danger">
                                                Player Name can only contain letters and numbers, no special characters or spaces.
                                            </div>
                                        }
                                    </Form.Group>

                                    <Form.Group controlId="colorPicker" className="mb-4">
                                        <Form.Label>Pick Your Snake Color</Form.Label>
                                        <Form.Control
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            style={{maxWidth: "50px"}}
                                        />
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button className="button" onClick={handleStart}>
                                            <span className="actual-text">Continue {sessionId && "and Join"}</span>
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default StartPage;
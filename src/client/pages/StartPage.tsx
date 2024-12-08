import React, {useState, useRef, useEffect} from "react";
import {ColorUtil} from "../game/util/ColorUtil";
import {Button, Card, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";

interface StartPageProps {
    onStart: (playerName: string, color: string, sessionId: string) => void;
    theme: string;
}

const StartPage: React.FC<StartPageProps> = ({onStart, theme}) => {
    const [playerName, setPlayerName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [color, setColor] = useState<string>(ColorUtil.getRandomColorRGB());
    const [sessionId, setSessionId] = useState<string>("");

    const handleStart = () => {
        if (playerName.trim()) {
            onStart(playerName, color, sessionId);
        } else {
            alert("Please enter your name");
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
        <>
            <Container className="vh-100 d-flex justify-content-center">
                <div>
                    <Row>
                        <Col className="col-12 text-center">
                            <h1>Welcome to Snake Extreme!</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="col-12">
                            <Card className="p-4 shadow"
                                  bg={theme === 'light' ? 'light' : 'dark'}
                                  text={theme === 'light' ? 'dark' : 'light'}>
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
                                                    onChange={(e) => setPlayerName(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    ref={inputRef}
                                                />
                                            </InputGroup>
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
                                            <button className="button" onClick={handleStart}>
                                                <span className="actual-text">Weiter {sessionId && ("and Join")}</span>
                                            </button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Container>
        </>
    );
};

export default StartPage;
import React, {useState, useRef, useEffect} from "react";
import {ColorUtil} from "../game/util/ColorUtil";
import {Button, Card, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";

interface StartPageProps {
    onStart: (playerName: string, color: string) => void;
    theme: string;
}

const StartPage: React.FC<StartPageProps> = ({onStart, theme}) => {
    const [playerName, setPlayerName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const [color, setColor] = useState<string>(ColorUtil.getRandomColorRGB());

    const handleStart = () => {
        if (playerName.trim()) {
            onStart(playerName, color);
        } else {
            alert("Please enter your name");
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleStart();
        }
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="p-4 shadow" bg={theme === 'light' ? 'light' : 'dark'}
                  text={theme === 'light' ? 'dark' : 'light'}>
                <Card.Body>
                    <Card.Title className="text-center">Welcome to Snake Extreme!</Card.Title>
                    <Form>
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
                            <Button variant="primary" size="lg" onClick={handleStart}>
                                Start
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default StartPage;
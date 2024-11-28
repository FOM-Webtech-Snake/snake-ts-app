import React, {useState, useRef, useEffect} from "react";
import {ColorUtil} from "../game/util/ColorUtil";
import {Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";

interface StartPageProps {
    onStart: (playerName: string, color: string) => void;
}

const StartPage: React.FC<StartPageProps> = ({onStart}) => {
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
        <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
            <Row className="text-center mb-4">
                <Col>
                    <h1>Welcome to Snake Extreme!</h1>
                </Col>
            </Row>
            <Form className="w-100" style={{maxWidth: "400px"}}>
                <Row>
                    <Col>
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
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="colorPicker" className="mb-4">
                            <Form.Label>Pick Your Snake Color</Form.Label>
                            <Form.Control
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{maxWidth: "50px"}}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col className="text-center">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleStart}
                        >
                            Start
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default StartPage;
import React, {useState, useRef, useEffect} from "react";
import {ColorUtil} from "../game/util/ColorUtil";
import {Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import logo from '/public/assets/logo.svg';
import "../../../public/css/button.css"; //Importing CSS

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
        <Container
            className="d-flex flex-column justify-content-center align-items-center vh-100"
            style={{
                backgroundImage: `url(${logo})`,
                backgroundSize: "cover", // Hintergrund proportional abdecken
                backgroundPosition: "center", // Hintergrund zentrieren
                backgroundRepeat: "repeat", // Keine Wiederholung
                width: "100vw", // Gesamte Breite des Viewports
                height: "100vh", // Gesamte Höhe des Viewports
            }}
        >
            <div className="d-flex flex-column align-items-center vh-100">
                <h1 className="glow-text">Snake Extreme</h1>
                <Form className="w-100" style={{ maxWidth: "200px", marginTop: "650px" }}>
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
                                    onKeyDown={handleKeyDown}
                                    style={{ maxWidth: "50px" }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-center">
                            <button className="button" data-text="Awesome">
                                <span className="actual-text">&nbsp;Start&nbsp;</span>
                                <span aria-hidden="true" className="hover-text">&nbsp;Start&nbsp;</span>
                            </button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Container>


    );
};

export default StartPage;
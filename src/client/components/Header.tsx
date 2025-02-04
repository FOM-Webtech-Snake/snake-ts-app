import React, {forwardRef, useState} from 'react';
import {useGameSessionSocket} from "./GameSessionContext";
import {Player} from "../../shared/model/Player";
import {Button, Container, Nav, Navbar} from "react-bootstrap";
import SnakeLogo from '../../../public/assets/snake_logo.png';
import {useTheme} from "./ThemeProvider";
import socket from "../socket/socket";
import HelpModal from "./HelpModal";

interface HeaderProps {
    player: Player | null;
}

const Header = forwardRef<HTMLDivElement, HeaderProps>(({player}, ref) => {

    const {session} = useGameSessionSocket()
    const {theme, toggleTheme} = useTheme();


    const [showHelpModal, setShowHelpModal] = useState(false);
    const handleShowHelpModal = () => setShowHelpModal(true);
    const handleCloseHelpModal = () => setShowHelpModal(false);

    return (
        <>
            <Navbar ref={ref} expand="lg">
                <Container>
                    <Navbar.Brand>
                        {/* todo replace this logo by another */}
                        <img
                            src={SnakeLogo}
                            width="30"
                            height="30"
                            className="d-inline-block align-top snake-logo"
                            alt="Snake Extreme Logo"
                        />
                    </Navbar.Brand>

                    {/* player info */}
                    {player?.getName() && (
                        <Navbar.Text>
                            <div>
                                <strong>Player:</strong> {player.getName()}
                                <div
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: player.getColor(),
                                        display: 'inline-block',
                                        marginLeft: '10px',
                                        border: '1px solid #fff',
                                        borderRadius: '50%',
                                        position: 'relative',
                                        top: '3px'
                                    }}
                                ></div>
                            </div>
                        </Navbar.Text>
                    )}

                    {/* theme toggle button */}
                    <Button onClick={toggleTheme}
                            variant={theme === 'light' ? "outline-dark" : "outline-light"}
                            className="ms-auto me-0 border-0">
                        <i className={theme === "light" ? "fa fa fa-moon" : "fa fa fa-sun"}/>
                    </Button>

                    {/* help button */}
                    <Button onClick={handleShowHelpModal}
                            variant={theme === 'light' ? "outline-dark" : "outline-light"}
                            className="ms-auto me-0 border-0">
                        <i className={"fa fa-question"}/>
                    </Button>

                    {/* navbar toggle for mobile */}
                    <Navbar.Toggle aria-controls="basic-navbar-nav"/>

                    {/* collapse content */}
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            {/* socket id */}
                            {socket?.id && (
                                <Nav.Item className="me-3">
                                    <strong>ID:</strong> {socket.id}
                                </Nav.Item>
                            )}

                            {/* session id on the right */}
                            {session?.getId() && (
                                <Nav.Item>
                                    <strong>Session ID:</strong> {session.getId()}
                                </Nav.Item>
                            )}
                        </Nav>
                    </Navbar.Collapse>

                </Container>
            </Navbar>

            <HelpModal
                show={showHelpModal}
                onClose={handleCloseHelpModal}
            />
        </>
    );
});

export default Header;
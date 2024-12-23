import React, {forwardRef} from 'react';
import {useGameSessionSocket} from "./GameSessionContext";
import {Player} from "../../shared/model/Player";
import {Button, Container, Navbar, Nav} from "react-bootstrap";
import SnakeLogo from '../../../public/img/snake_logo.png';
import {useTheme} from "./ThemeProvider";
import socket from "../socket/socket";

interface HeaderProps {
    player: Player | null;
}

const Header = forwardRef<HTMLDivElement, HeaderProps>(({player}, ref) => {

    const {session} = useGameSessionSocket()
    const {theme, toggleTheme} = useTheme();

    return (
        <Navbar ref={ref} expand="lg">
            <Container>
                <Navbar.Brand>
                    {/* todo replace this logo by another */}
                    <img
                        src={SnakeLogo}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
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

                {/* navbar roggle for mobile */}
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>

                {/* collapse content */}
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {/* socket id */}
                        {socket?.id && (
                            <Nav.Item>
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
    );
});

export default Header;
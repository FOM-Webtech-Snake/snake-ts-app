import React, {forwardRef} from 'react';
import {useGameSessionSocket} from "./GameSessionContext";
import {Player} from "../../shared/model/Player";
import {Button, Container, Navbar} from "react-bootstrap";
import SnakeLogo from '../../../public/img/snake_logo.png';
import {useTheme} from "./ThemeProvider";
import socket from "../socket/socket";

interface HeaderProps {
    player: Player | null;
}

const Header = forwardRef<HTMLDivElement, HeaderProps>(({ player }, ref) => {

    const {session} = useGameSessionSocket()
    const {theme, toggleTheme} = useTheme();

    return (
        <Navbar ref={ref} className="mb-4">
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

                <Navbar.Text>

                    {/* player info */}
                    {player?.getName() && (
                        <div>
                            <strong>Player:</strong> {player.getName()}
                            <div
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: player.getColor(),
                                    display: "inline-block",
                                    marginLeft: "10px",
                                    border: "1px solid #fff",
                                    borderRadius: "50%",
                                }}
                            ></div>
                        </div>)}

                    {/* socket id */}
                    {socket?.id && (
                        <div>
                            <strong>ID:</strong> {socket.id}
                        </div>)}
                </Navbar.Text>

                {/* session id on the right */}
                {session?.getId() && (
                    <Navbar.Text className={"mr-auto"}>
                        <strong>Session ID:</strong> {session.getId()}
                    </Navbar.Text>
                )}

                <Navbar.Text className="ms-auto">
                    <Button onClick={toggleTheme} variant="secondary">
                        {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    </Button>
                </Navbar.Text>
            </Container>
        </Navbar>
    );
});

export default Header;
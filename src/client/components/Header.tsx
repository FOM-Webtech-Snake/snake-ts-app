import React from 'react';
import {useGameSessionSocket} from "./GameSessionSocketContext";
import {Player} from "../../shared/model/Player";
import {Button, Container, Navbar} from "react-bootstrap";
import SnakeLogo from '../../../public/img/snake_logo.png';

interface HeaderProps {
    player: Player | null;
    theme: string;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({player, theme, toggleTheme}) => {

    const {socket, session} = useGameSessionSocket()

    return (
        <Navbar bg={theme === 'light' ? 'light' : 'dark'} variant={theme === 'light' ? 'light' : 'dark'}
                className="mb-4">
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
                    <Button onClick={toggleTheme} variant={theme === 'light' ? 'secondary' : 'light'}>
                        {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    </Button>
                </Navbar.Text>
            </Container>
        </Navbar>
    );
};

export default Header;
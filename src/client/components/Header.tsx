import React from 'react';
import {useGameSessionSocket} from "./GameSessionSocketContext";
import {Player} from "../../shared/model/Player";
import {Col, Container, Navbar, Row} from "react-bootstrap";

interface HeaderProps {
    player: Player | null;
}

const Header: React.FC<HeaderProps> = ({player}) => {

    const {socket, session} = useGameSessionSocket()

    return (
        <Navbar className="navbar-dark bg-secondary fixed-top">
            <Container>
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
            </Container>
        </Navbar>
    );
};

export default Header;
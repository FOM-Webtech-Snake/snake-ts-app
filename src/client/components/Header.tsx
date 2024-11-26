import React from 'react';
import {useGameSessionSocket} from "./GameSessionSocketContext";
import {Player} from "../../shared/model/Player";
import {Col, Container, Row} from "react-bootstrap";

interface HeaderProps {
    player: Player | null;
}

const Header: React.FC<HeaderProps> = ({player}) => {

    const {socket, session} = useGameSessionSocket()

    return (
        <header className="bg-secondary text-white">
            <Container fluid>
                <Row className="align-items-center py-2">
                    <Col md={6}>
                        <div>
                            {player?.getName() && (
                                <div className="d-inline-flex align-items-center">
                                    <strong>Player:</strong>
                                    <span className="ms-1">{player.getName()}</span>
                                    {player?.getColor() && (
                                        <div
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: player.getColor(),
                                                marginLeft: '10px',
                                                border: '1px solid #fff',
                                                borderRadius: '50%',
                                            }}
                                        ></div>
                                    )}
                                </div>
                            )}
                        </div>
                        {socket?.id && (
                            <div className="text-muted small">
                                ID: {socket.id}
                            </div>
                        )}
                    </Col>
                    <Col md={6} className="text-md-end mt-2 mt-md-0">
                        {session?.getId() && (
                            <span>
                                <strong>Session ID:</strong> {session.getId()}
                            </span>
                        )}
                    </Col>
                </Row>
            </Container>
        </header>
    );
};

export default Header;
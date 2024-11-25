import React, {useEffect, useState} from 'react';
import {useGameSessionSocket} from "./GameSessionSocketContext";
import {Player} from "../../shared/Player";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import {getLogger} from "../../shared/config/LogConfig";
import {Badge, Col, Container, ListGroup, Row} from "react-bootstrap";
import {PlayerStatusEnum} from "../../shared/constants/PlayerStatusEnum";

interface PlayerListProps {
}

const log = getLogger("client.components.PlayerList");

const PlayerList: React.FC<PlayerListProps> = ({}) => {
    const {session} = useGameSessionSocket();
    const [players, setPlayers] = useState<Player[] | null>(null);

    useEffect(() => {
        if (session) {
            // Listen for updates to the session and players
            const sortedPlayers = (session.getPlayersAsArray() || []).sort(
                (a, b) => b.getScore() - a.getScore() // Sort in descending order of score
            );
            setPlayers(sortedPlayers);
            log.debug(`updated players ${sortedPlayers}`);
        }
    }, [session]);

    if (!players) {
        return <p className="text-white text-center">Waiting for players to join...</p>;
    }

    return (
        <Container className="text-white">
            <Row>
                <Col>
                    <h2 className="text-center mb-3">Players in Lobby</h2>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ListGroup>
                        {Object.entries(players).map(([key, player]) => (
                            <ListGroup.Item
                                key={key}
                                className="d-flex justify-content-between align-items-center"
                                style={{
                                    backgroundColor: '#343a40',
                                    color: '#fff',
                                }}
                            >
                                <span className="d-flex align-items-center">
                                    {player.getColor() && (
                                        <div
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: player.getColor(),
                                                borderRadius: '50%',
                                                border: '1px solid #fff',
                                                marginRight: '10px',
                                            }}
                                        ></div>
                                    )}
                                    {player.getName()}
                                    {player.getStatus() === PlayerStatusEnum.DEAD && (
                                        <span
                                            style={{
                                                marginLeft: '10px',
                                                color: 'red',
                                                fontSize: '1.2rem',
                                            }}
                                            title="Player is dead"
                                        >
                                            &#x2620; {/* Unicode skull and crossbones symbol */}
                                        </span>
                                    )}
                                </span>
                                <span className="d-flex align-items-center">
                                    <span className="me-3">Score: {player.getScore()}</span>
                                    {player.getRole() === PlayerRoleEnum.HOST && (
                                        <Badge bg="success">Host</Badge>
                                    )}
                                </span>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    );
};

export default PlayerList;

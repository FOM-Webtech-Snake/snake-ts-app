import React, {useEffect, useState} from 'react';
import {Badge, Card, Container, ListGroup} from 'react-bootstrap';
import {PlayerStatusEnum} from "../../shared/constants/PlayerStatusEnum";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import {useGameSessionSocket} from "./GameSessionSocketContext";
import {Player} from "../../shared/model/Player";
import {getLogger} from "../../shared/config/LogConfig";

interface PlayerListProps {
    theme: string;
}

const log = getLogger("client.components.PlayerList");

const PlayerList: React.FC<PlayerListProps> = ({theme}) => {
    const {session, players} = useGameSessionSocket();
    const [sortedPlayers, setSortedPlayers] = useState<Player[] | null>(null);

    useEffect(() => {
        if (session) {
            if (session.getPlayersAsArray()) {
                // Listen for updates to the session and players
                const sortedPlayers = (session.getPlayersAsArray() || []).sort(
                    (a, b) => b.getScore() - a.getScore() // Sort in descending order of score
                );
                setSortedPlayers(sortedPlayers);
                log.debug(`updated players ${sortedPlayers}`);
            }
        }
    }, [session, players]);

    return (
        <>
            <Container style={{
                height: '100vh',
                position: 'sticky',
                top: 0,
                overflowY: 'auto',
                padding: '1rem',
            }}>
                <Card className="p-4 shadow"
                      bg={theme === 'light' ? 'light' : 'dark'}
                      text={theme === 'light' ? 'dark' : 'light'}>
                    <Card.Title className="text-center">Players in Lobby</Card.Title>
                    <Card.Body>
                        <p className="text-white text-center">{session.getPlayerCount()} / {session.getConfig().getMaxPlayers()}</p>
                        {!sortedPlayers ? (
                            <p className="text-white text-center">Waiting for players to join...</p>
                        ) : (
                            <>
                                {/* Sidebar content here */}
                                <ListGroup>
                                    {Object.entries(sortedPlayers).map(([key, player]) => (
                                        <ListGroup.Item
                                            key={key}
                                            className="d-flex justify-content-between align-items-center"
                                            style={{
                                                backgroundColor: '#343a40',
                                                color: '#fff',
                                            }}>

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
                                                {player.getName()}
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
                            </>
                        )}

                    </Card.Body>
                </Card>
            </Container>
        </>
    );
};

export default PlayerList;

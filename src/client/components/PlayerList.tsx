import React, {useEffect, useState} from 'react';
import {Badge, Card, Container, ListGroup} from 'react-bootstrap';
import {PlayerStatusEnum} from "../../shared/constants/PlayerStatusEnum";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import {useGameSessionSocket} from "./GameSessionContext";
import {Player} from "../../shared/model/Player";
import {getLogger} from "../../shared/config/LogConfig";
import socket from "../socket/socket";
import {registerReactEvent} from "../socket/socketRouter";
import {SocketEvents} from "../../shared/constants/SocketEvents";

interface PlayerListProps {
}

const log = getLogger("client.components.PlayerList");

const PlayerList: React.FC<PlayerListProps> = () => {
    const {session} = useGameSessionSocket();
    const [sortedPlayers, setSortedPlayers] = useState<Player[] | null>(session.getPlayersAsArray());

    useEffect(() => {
        if (!socket) return;

        registerReactEvent(SocketEvents.SessionState.PLAYER_LIST, (data) => {
            log.trace("received player list", data);
            const players = Object.values(data).map(entry => Player.fromData(entry));

            log.trace("mapped player list", players);
            const sortedPlayers = (players || []).sort(
                (a, b) => b.getScore() - a.getScore() // Sort in descending order of score
            );

            setSortedPlayers(sortedPlayers);
            log.trace("updated players", sortedPlayers);
        });

    }, []);

    return (
        <>
            {/* Desktop view - full card */}
            <Container
                style={{
                    overflowY: 'auto',
                    padding: '1rem',
                }}
                className="d-none d-md-block"
            >
                <Card className="mb-3 shadow">
                    <Card.Header className="text-center">
                        <h6 className="mb-0">Players in Lobby</h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                        {/* Existing desktop player list content */}
                        {!sortedPlayers ? (
                            <p className="text-center">Waiting for players to join...</p>
                        ) : (
                            <ListGroup>
                                {Object.entries(sortedPlayers).map(([key, player]) => (
                                    <ListGroup.Item
                                        key={key}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <span className="d-flex align-items-center">
                                            {player.getColor() && player.getStatus() !== PlayerStatusEnum.DEAD && (
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
                                                        marginRight: '3px',
                                                        color: 'red',
                                                        fontSize: '0.9rem',
                                                    }}
                                                    title="Player is dead"
                                                >
                                                    &#x2620; {/* Unicode skull and crossbones symbol */}
                                                </span>
                                            )}
                                            <span
                                                style={{
                                                    maxWidth: '100px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {player.getName()}
                                            </span>
                                        </span>

                                        <span>
                                        {player.getScore()}
                                            {player.getRole() === PlayerRoleEnum.HOST && (
                                                <Badge bg="success" className="ms-2"
                                                       style={{fontSize: '0.7rem'}}>H</Badge>
                                            )}
                            </span>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Mobile view - floating player list */}
            <div
                className="d-md-none position-absolute start-0 m-2 bg-dark text-light rounded p-2 z-3"
                style={{
                    top: '75px',
                    width: '175px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    opacity: 0.6,
                    fontSize: '0.9rem',
                }}
            >
                <h6 className="text-center mb-2">Players</h6>
                {!sortedPlayers ? (
                    <p className="text-center">Waiting for players to join...</p>
                ) : (
                    <ListGroup variant="flush">
                        {Object.entries(sortedPlayers).map(([key, player]) => (
                            <ListGroup.Item
                                key={key}
                                className="d-flex justify-content-between align-items-center bg-transparent text-light p-1"
                            >
                            <span className="d-flex align-items-center">
                                {player.getColor() && player.getStatus() !== PlayerStatusEnum.DEAD && (
                                    <div
                                        style={{
                                            width: '15px',
                                            height: '15px',
                                            backgroundColor: player.getColor(),
                                            borderRadius: '50%',
                                            border: '1px solid #fff',
                                            marginRight: '8px',
                                        }}
                                    ></div>
                                )}
                                {player.getStatus() === PlayerStatusEnum.DEAD && (
                                    <span
                                        style={{
                                            marginRight: '3px',
                                            color: 'red',
                                            fontSize: '0.9rem',
                                        }}
                                        title="Player is dead"
                                    >
                                        &#x2620; {/* Unicode skull and crossbones symbol */}
                                    </span>
                                )}
                                <span
                                    style={{
                                        maxWidth: '75px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {player.getName()}
                                </span>
                            </span>
                                <span>
                                {player.getScore()}
                                    {player.getRole() === PlayerRoleEnum.HOST && (
                                        <Badge bg="success" className="ms-2" style={{fontSize: '0.7rem'}}>H</Badge>
                                    )}
                            </span>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </div>
        </>
    );
};

export default PlayerList;

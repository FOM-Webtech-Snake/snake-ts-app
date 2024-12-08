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
        <Container style={{
            overflowY: 'auto',
            padding: '1rem',
        }}>
            <Card className="p-4 shadow">
                <Card.Title className="text-center">Players in Lobby</Card.Title>
                <Card.Body>
                    {!sortedPlayers ? (
                        <p className="text-center">Waiting for players to join...</p>
                    ) : (
                        <>
                            {/* Sidebar content here */}
                            <ListGroup>
                                {Object.entries(sortedPlayers).map(([key, player]) => (
                                    <ListGroup.Item
                                        key={key}
                                        className="d-flex justify-content-between align-items-center">

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
    );
};

export default PlayerList;

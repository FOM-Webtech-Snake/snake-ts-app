import React, {useEffect, useState} from 'react';
import {Card, Container, ListGroup} from 'react-bootstrap';
import {useGameSessionSocket} from "./GameSessionContext";
import {Player} from "../../shared/model/Player";
import {getLogger} from "../../shared/config/LogConfig";
import socket from "../socket/socket";
import {registerReactEvent} from "../socket/socketRouter";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import PlayerListItem from "./PlayerListItem";

const log = getLogger("client.components.PlayerList");

interface PlayerListProps {
}

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

    const renderPlayerList = (isMobile: boolean) => {
        if (!sortedPlayers) {
            return <p className="text-center">Waiting for players to join...</p>;
        }

        return (
            <ListGroup variant={isMobile ? "flush" : undefined}>
                {sortedPlayers.map((player, index) => (
                    <PlayerListItem
                        key={`player-${index}`}
                        player={player}
                        isMobile={isMobile}
                    />
                ))}
            </ListGroup>
        );
    };

    return (
        <>
            {/* Desktop view */}
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
                        {renderPlayerList(false)}
                    </Card.Body>
                </Card>
            </Container>

            {/* Mobile view */}
            <div
                className="d-md-none position-absolute start-0 m-2 bg-dark text-light rounded p-2 z-3"
                style={{
                    top: '75px',
                    width: '175px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    opacity: 0.6,
                    fontSize: '0.9rem',
                }}
            >
                <h6 className="text-center mb-2">Players</h6>
                {renderPlayerList(true)}
            </div>
        </>
    );
};

export default PlayerList;
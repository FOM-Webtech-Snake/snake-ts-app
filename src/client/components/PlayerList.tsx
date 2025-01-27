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
    desktopViewOnly?: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({desktopViewOnly = false}) => {
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

    const renderPlayerCard = (isMobile: boolean) => (
        <Card className={`mb-3 shadow ${isMobile ? 'bg-dark text-light rounded' : ''}`}>
            <Card.Header className="text-center d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{isMobile ? 'Players' : 'Players in Lobby'}</h6>
                <span className={`badge ${isMobile ? 'bg-light text-dark' : 'bg-primary'}`}>
                    {sortedPlayers?.length || 0}
                </span>
            </Card.Header>
            <Card.Body className="text-center">
                {renderPlayerList(isMobile)}
            </Card.Body>
        </Card>
    );

    if (desktopViewOnly) {
        return (
            <Container style={{
                overflowY: 'auto',
                padding: '2rem',
                maxHeight: 'calc(100vh - 65vh)'
            }}>
                {renderPlayerCard(false)}
            </Container>
        );
    }

    return (
        <>
            {/* Desktop view */}
            <Container className="d-none d-md-block"
                       style={{
                           overflowY: 'auto',
                           maxHeight: 'calc(100vh - 450px)'
                       }}>
                {renderPlayerCard(false)}
            </Container>

            {/* Mobile view */}
            <div
                className="d-md-none position-absolute start-0 m-2 z-3"
                style={{
                    top: '75px',
                    width: '175px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    opacity: 0.6,
                    fontSize: '0.9rem',
                }}
            >
                {renderPlayerCard(true)}
            </div>
        </>
    );
};

export default PlayerList;
import React, {useEffect, useState} from 'react';
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionContext";
import {Modal, Button, Container} from "react-bootstrap";
import {registerReactEvent, unregisterReactEvent} from "../socket/socketRouter";
import socket from "../socket/socket";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import "/public/css/endgamedisplay.css";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import WinGif from "../../../public/assets/WinGif.gif"
import LoseGif from "../../../public/assets/lose.gif"

const log = getLogger("client.components.DeathDisplay");

const DeathDisplay: React.FC = () => {
    const {playerId, session} = useGameSessionSocket();
    const [isPlayerDead, setIsPlayerDead] = useState(false);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [respawnEnabled, setRespawnEnabled] = useState(false);

    const onGameOver = (state: GameStateEnum) => {
        log.debug(`Game State Changed: ${state}`);

        if (state === GameStateEnum.GAME_OVER) {
            log.debug("Game Over event received");

            if (!respawnEnabled) {
                log.debug("Respawn is disabled.");
                // TODO Deathmatch Modal beim Tod anzeigen
            }

            setWinnerId(session.getTopPlayer().getId());
            log.info("Spieler mit den meisten Punkten:", session.getTopPlayer());
            log.info("All Players: ", session.getPlayersAsArray());
        }
    };

    useEffect(() => {
        if (!socket) {
            log.error("Socket not initialized");
            return;
        }

        log.debug("Registering event listeners");
        registerReactEvent(SocketEvents.GameControl.STATE_CHANGED, onGameOver);

        const config = session.getConfig();
        if (config) {
            setRespawnEnabled(config.getRespawnAfterDeathEnabled());
            log.info(`Respawn Status: ${respawnEnabled}`);
        } else {
            log.warn("Respawn configuration is undefined or not a boolean.");
        }

        return () => {
            log.info("Unregistering event listeners");
            unregisterReactEvent(SocketEvents.GameControl.STATE_CHANGED);
        };
    }, []);

    return (
        <Container>
            <Modal show={winnerId !== null} onHide={() => {
            }} centered dialogClassName="death-modal-dark">
                <Modal.Header closeButton>
                    <Modal.Title>Spielende</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {winnerId === playerId ? (
                        <>
                            <p>Du hast gewonnen!</p>
                            <img src={WinGif} alt="Winner Animation"
                                 style={{width: '100%', height: 'auto'}}/>
                        </>
                    ) : (
                        <>
                            <p>Du hast verloren</p>
                            <img src={LoseGif} alt="Game Over Animation"
                                 style={{width: '100%', height: 'auto'}}/>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-dark">
                    <Button variant="primary" onClick={() => setWinnerId(null)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default DeathDisplay;







import React, { useEffect, useState } from 'react';
import { getLogger } from "../../shared/config/LogConfig";
import { useGameSessionSocket } from "./GameSessionContext";
import { Modal, Button, Container } from "react-bootstrap";
import { registerReactEvent, unregisterReactEvent } from "../socket/socketRouter";
import socket from "../socket/socket";
import { SocketEvents } from "../../shared/constants/SocketEvents";
import "/public/css/endgamedisplay.css";
import { GameStateEnum } from "../../shared/constants/GameStateEnum";
import { Player } from "../../shared/model/Player";

const log = getLogger("client.components.DeathDisplay");

const DeathDisplay: React.FC = () => {
    const { playerId, session } = useGameSessionSocket();
    const [isPlayerDead, setIsPlayerDead] = useState(false);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [respawnEnabled, setRespawnEnabled] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const [deathCount, setDeathCount] = useState<{ [key: string]: number }>({});
    const [playersScores, setPlayersScores] = useState<{ [key: string]: number }>({});

    const incrementDeathCount = (playerId: string) => {
        setDeathCount((prevDeathCount) => {
            const newDeathCount = { ...prevDeathCount };
            if (!newDeathCount[playerId]) {
                newDeathCount[playerId] = 0;
            }
            newDeathCount[playerId] += 1;

            console.log(`Player ${playerId} has died ${newDeathCount[playerId]} times.`);
            return newDeathCount;
        });
    };


    const onPlayerDeath = (playeriddied: string) => {
        log.info(`Player died: ${playeriddied}`);
        incrementDeathCount(playeriddied);
    };

    const onGameOver = (state: GameStateEnum) => {
        log.info(`Game State Changed: ${state}`);

        if (state === GameStateEnum.GAME_OVER) {
            log.info("Game Over event received");

            if (!respawnEnabled) {
                log.info("Respawn is disabled.");
            }
            setGameOver(true);




            log.info("Spieler mit den meisten Punkten:", session.getTopPlayer());


        }
    };


    useEffect(() => {
        if (!socket) {
            log.error("Socket not initialized");
            return;
        }

        const players = session.getPlayers();
        console.log("Alle Spieler beim Start:", players);

        log.info("Registering event listeners");

        registerReactEvent(SocketEvents.PlayerActions.PLAYER_DIED, onPlayerDeath);
        registerReactEvent(SocketEvents.GameControl.STATE_CHANGED, onGameOver);

        const config = session.getConfig();
        if (config && typeof config.getRespawnAfterDeathEnabled === "function") {
            const respawnStatus = config.getRespawnAfterDeathEnabled(); // Methode aufrufen
            setRespawnEnabled(respawnStatus);
            log.info(`Respawn Status: ${respawnStatus}`);
        } else {
            log.warn("Respawn configuration is undefined or not a boolean.");
        }

        return () => {
            log.info("Unregistering event listeners");
            unregisterReactEvent(SocketEvents.PlayerActions.PLAYER_DIED);
            unregisterReactEvent(SocketEvents.GameControl.STATE_CHANGED);
        };
    }, [deathCount, playersScores]);

    return (
        <Container>
            <Modal show={isPlayerDead} onHide={() => setIsPlayerDead(false)} centered dialogClassName="death-modal-dark">
                <Modal.Header closeButton>
                    <Modal.Title>Game Over</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Viel Glück beim nächsten Mal!</p>
                    <img src="/assets/lose.gif" alt="Game Over Animation" style={{ width: '100%', height: 'auto' }} />
                </Modal.Body>
                <Modal.Footer className="modal-footer-dark">
                    <Button variant="secondary" onClick={() => setIsPlayerDead(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={winnerId !== null} onHide={() => {}} centered dialogClassName="death-modal-dark">
                <Modal.Header closeButton>
                    <Modal.Title>Spielende</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {winnerId === playerId ? (
                        <>
                            <p>Du hast gewonnen!</p>
                            <img src="/assets/WinGif.gif" alt="Winner Animation" style={{ width: '100%', height: 'auto' }} />
                        </>
                    ) : (
                        <>
                            <p>Du hast verloren</p>
                            <img src="/assets/lose.gif" alt="Game Over Animation" style={{ width: '100%', height: 'auto' }} />
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







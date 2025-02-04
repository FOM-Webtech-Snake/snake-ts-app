import React, {useEffect, useState} from 'react';
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionContext";
import {Button, Container, Modal} from "react-bootstrap";
import socket from "../socket/socket";
import "/public/css/endgamedisplay.css";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import WinGif from "../../../public/assets/WinGif.gif"
import LoseGif from "../../../public/assets/lose.gif"

const log = getLogger("client.components.DeathDisplay");

const DeathDisplay: React.FC = () => {
    const {playerId, session} = useGameSessionSocket();
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameStateEnum | null>(session.getGameState() || null);

    useEffect(() => {
        if (!socket) {
            log.error("Socket not initialized");
            return;
        }

        if (gameState !== session.getGameState() && // only trigger when game state is changed
            session.getGameState() === GameStateEnum.GAME_OVER) {

            setGameState(session.getGameState()); // store the current game state
            setWinnerId(session.getTopPlayer().getId());

            log.debug("Player with highest score:", session.getTopPlayer());
            log.debug("All Players: ", session.getPlayersAsArray());
        }

    }, [session]);

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







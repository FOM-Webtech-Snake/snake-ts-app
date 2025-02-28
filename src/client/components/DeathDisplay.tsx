import React, {useEffect, useState} from 'react';
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionContext";
import {Button, Container, Modal} from "react-bootstrap";
import socket from "../socket/socket";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import WinGif from "../../../public/assets/WinGif.gif"
import LoseGif from "../../../public/assets/lose.gif"
import {useTheme} from "./ThemeProvider";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {useGameState} from "./GameStateContext";

const log = getLogger("client.components.DeathDisplay");

const DeathDisplay: React.FC = () => {
    const {theme} = useTheme();
    const {playerId, session} = useGameSessionSocket();
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameStateEnum | null>(session.getGameState() || null);
    const {setGameReady} = useGameState();

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
        } else {
            setGameState(session.getGameState());
        }
    }, [session]);

    const backToLobby = () => {
        setWinnerId(null)
        if (socket) {
            socket.emit(SocketEvents.GameControl.RESET_GAME);
            setGameReady(false);
        }
    };


    return (
        <Container>
            <Modal className={`modal ${theme}`} show={winnerId !== null} onHide={() => { }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Game Over</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {winnerId === playerId ? (
                        <>
                            <p>You won!</p>
                            <img src={WinGif} alt="Winner Animation" style={{ width: '100%', height: 'auto' }} />
                        </>
                    ) : (
                        <>
                            <p>You lost</p>
                            <img src={LoseGif} alt="Game Over Animation" style={{ width: '100%', height: 'auto' }} />
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-dark">
                    <Button variant="primary" onClick={() => backToLobby()}>Back to Lobby</Button>
                </Modal.Footer>
            </Modal>
        </Container>

    );
};

export default DeathDisplay;







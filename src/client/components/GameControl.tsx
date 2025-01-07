import React, {useEffect, useState} from 'react';
import {Button, Card, Container} from 'react-bootstrap';
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionContext";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import socket from "../socket/socket";
import {useGameState} from "./GameStateContext";

interface GameControlPanelProps {
}

const log = getLogger("client.components.GameControlPanel");

const GameControlPanel: React.FC<GameControlPanelProps> = () => {

    const {status} = useGameSessionSocket();
    const [isPlaying, setIsPlaying] = useState(false);
    const {setGameReady} = useGameState();


    useEffect(() => {
        if (status) {
            switch (status) {
                case GameStateEnum.RUNNING:
                    setIsPlaying(true);
                    break;
                case GameStateEnum.PAUSED:
                    setIsPlaying(false);
                    break;
            }
        }
    }, [status]);

    // State to manage game status (play, pause)

    // Handle play/pause toggle
    const togglePlayPause = () => {

        setIsPlaying((prev) => !prev);
    };

    // Handle game restart
    const restartGame = () => {
        if (socket) {
            socket.emit(SocketEvents.GameControl.RESET_GAME);
        }
    };

    const backToLobby = () => {
        if (socket) {
            socket.emit(SocketEvents.GameControl.RESET_GAME);
            setGameReady(false);
        }
    };


    return (
        <Container style={{
            overflowY: 'auto',
            padding: '1rem',
        }}
        className="d-none d-md-block"
        >
            <Card className="p-4 shadow">
                <Card.Body>
                    <div className="d-flex justify-content-center">
                        {/*<Button variant="secondary" onClick={restartGame} className="mx-2">*/}
                        {/*    <i className={"fa fa-rotate-backward"}/>*/}
                        {/*</Button>*/}
                        <Button variant="secondary" onClick={backToLobby} className="mx-2">
                            <i className={"fa fa-arrow-left"}/>
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default GameControlPanel;

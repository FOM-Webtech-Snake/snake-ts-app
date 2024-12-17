import React, {useEffect, useState} from 'react';
import {Button, Card, Container} from 'react-bootstrap';
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionContext";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import socket from "../socket/socket";

interface GameControlPanelProps {
}

const log = getLogger("client.components.GameControlPanel");

const GameControlPanel: React.FC<GameControlPanelProps> = () => {

    const {status} = useGameSessionSocket();
    const [isPlaying, setIsPlaying] = useState(false);


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
                        <Button variant="secondary" onClick={restartGame} className="mx-2">
                            <i className={"fa fa-rotate-backward"}/>
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default GameControlPanel;

import React, {useEffect, useState} from 'react';
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionSocketContext";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {Card, Container} from "react-bootstrap";

interface TimerDisplayProps {
}

const log = getLogger("client.components.TimerDisplay");

const TimerDisplay: React.FC<TimerDisplayProps> = () => {
    const {session, socket} = useGameSessionSocket();
    const [remainingTime, setRemainingTime] = useState(session.getConfig().getGameDuration());

    useEffect(() => {
        if (!socket) return;

        const onTimerUpdated = (time: number) => {
            log.debug("Timer update received:", time);
            setRemainingTime(time);
        };

        socket.on(SocketEvents.GameEvents.TIMER_UPDATED, onTimerUpdated);

        return () => {
            socket.off(SocketEvents.GameEvents.TIMER_UPDATED, onTimerUpdated);
        };

    }, [socket]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Container
            style={{
                overflowY: 'auto',
                padding: '1rem',
            }}>
            <Card className="p-4 shadow">
                <Card.Body>
                    <span style={{fontSize: '1.2rem'}}>remaining Time: </span>
                    <span
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                        }}
                    >
                        {formatTime(remainingTime)}
                    </span>
                </Card.Body>
            </Card>
        </Container>

    );
};

export default TimerDisplay;

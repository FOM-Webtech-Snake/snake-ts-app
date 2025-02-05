import React, {useEffect, useState} from 'react';
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionContext";
import {SocketEvents} from "../../shared/constants/SocketEvents";
import {Card, Container} from "react-bootstrap";
import {registerReactEvent, unregisterReactEvent} from "../socket/socketRouter";
import socket from "../socket/socket";

interface TimerDisplayProps {
}

const log = getLogger("client.components.TimerDisplay");

const TimerDisplay: React.FC<TimerDisplayProps> = () => {
    const {session} = useGameSessionSocket();
    const [remainingTime, setRemainingTime] = useState(session.getConfig().getGameDuration());

    useEffect(() => {
        if (!socket) return;

        const onTimerUpdated = (time: number) => {
            log.debug("Timer update received:", time);
            setRemainingTime(time);
        };

        registerReactEvent(SocketEvents.GameEvents.TIMER_UPDATED, (data) => {
            onTimerUpdated(data);
        });

        return () => {
            unregisterReactEvent(SocketEvents.GameEvents.TIMER_UPDATED);
        };

    }, [socket]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Desktop view - full card */}
            <Container className="d-none d-md-block"
                style={{
                    overflowY: 'auto',
                    padding: '1rem',
                }}>
                <Card className="m-3 shadow">
                    <Card.Header className="text-center">
                        <h6 className="mb-0">Remaining Time</h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                        <span>{formatTime(remainingTime)}</span>
                    </Card.Body>
                </Card>
            </Container>

            {/* Mobile view - floating timer */}
            <div
                className="d-md-none position-absolute end-0 m-2 bg-dark text-warning rounded p-1 z-3"
                style={{
                    fontSize: '1.2rem',
                    opacity: 0.6,
                    top: '75px',
                }}
            >
                {formatTime(remainingTime)}
            </div>
        </>
    );
};

export default TimerDisplay;

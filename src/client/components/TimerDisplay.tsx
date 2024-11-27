import React, { useEffect, useState } from 'react';
import {getLogger} from "../../shared/config/LogConfig";
import {useGameSessionSocket} from "./GameSessionSocketContext";

interface TimerDisplayProps {
}

const log = getLogger("client.components.PlayerList");

const TimerDisplay: React.FC<TimerDisplayProps> = ({}) => {
    const {session} = useGameSessionSocket();
    const [remainingTime, setRemainingTime] = useState(300);

    useEffect(() => {
        if (session) {
            setRemainingTime(session.getRemainingTime());
            log.debug(`updated timer`);
        }

        if (remainingTime <= 0) {
            log.debug('Die Zeit ist abgelaufen!');
            return;
        }

        // const timer = setInterval(() => {
        //     setRemainingTime((prevTime) => Math.max(prevTime - 1, 0));
        // }, 1000);

        // return () => clearInterval(timer);
    }, [remainingTime]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div>
    Zeit: {formatTime(remainingTime)}
    </div>
);
};

export default TimerDisplay;

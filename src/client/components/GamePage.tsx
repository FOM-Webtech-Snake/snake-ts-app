import React, {useEffect, useRef} from 'react';
import {GameUtil} from '../game/util/GameUtil';
import {ConfigUtil} from '../game/util/ConfigUtil';
import {useGameSessionSocket} from "./GameSessionSocketContext";


interface GamePageProps {
}

const GamePage: React.FC<GamePageProps> = ({}) => {
    const {socket} = useGameSessionSocket();
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const gameCreatedRef = useRef(false);

    useEffect(() => {
        if (gameContainerRef.current && !gameCreatedRef.current) {
            let gameConfig = ConfigUtil.createPhaserGameConfig(
                window.innerWidth * 0.8,
                window.innerHeight * 0.8,
                "game-container"
            );
            const game = GameUtil.createGame(
                gameConfig,
                socket,
            );
            gameCreatedRef.current = true;
        }
    }, []);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <div id="game-container" ref={gameContainerRef}>
                {/* game content will be rendered here by Phaser */}
            </div>
        </div>
    );
};

export default GamePage;
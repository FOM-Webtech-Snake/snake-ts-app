import React, {useEffect, useRef} from 'react';
import {GameUtil} from '../game/util/GameUtil';
import {ConfigUtil} from '../game/util/ConfigUtil';

interface GamePageProps {
    sessionId: string;
    playerId: string;
}

const GamePage: React.FC<GamePageProps> = ({sessionId, playerId}) => {
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const gameCreatedRef = useRef(false);

    useEffect(() => {
        console.debug("useEffect called");
        if (gameContainerRef.current && !gameCreatedRef.current) {
            console.debug("Container detected, creating game...");
            let gameConfig = ConfigUtil.createPhaserGameConfig(
                window.innerWidth * 0.8,
                window.innerHeight * 0.8,
                "game-container"
            );
            const game = GameUtil.createGame(
                gameConfig,
                sessionId,
                playerId
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
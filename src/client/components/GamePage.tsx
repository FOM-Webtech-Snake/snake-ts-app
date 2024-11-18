import React, {useEffect, useRef} from 'react';
import {GameUtil} from '../game/util/GameUtil';
import {ConfigUtil} from '../game/util/ConfigUtil';

const GameComponent: React.FC = () => {
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const gameCreatedRef = useRef(false);

    useEffect(() => {
        console.log("useEffect called");
        if (gameContainerRef.current && !gameCreatedRef.current) {
            console.log("Container detected, creating game...");
            const game = GameUtil.createGame(
                ConfigUtil.createPhaserGameConfig(
                    window.innerWidth * 0.8,
                    window.innerHeight * 0.8,
                    "game-container"
                )
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

export default GameComponent;
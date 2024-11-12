import React, {useEffect, useState} from 'react';
import StartPage from './StartPage';
import Footer from "./Footer";
import {GameUtil} from "../game/util/GameUtil";
import {GameConfigUtil} from "../game/util/GameConfigUtil";

const App: React.FC = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [playerName, setPlayerName] = useState<string | null>(null);

    const handleStart = (playerName: string) => {
        setGameStarted(true);
        setPlayerName(playerName);
    };

    useEffect(() => {
        if (gameStarted) {
            const game = GameUtil.createGame(GameConfigUtil.createGameConfig(800, 600, "game-container"));
        }
    });

    return (
        <div className="d-flex flex-column min-vh-100">
            {gameStarted ? (
                <div id="game-container" className="game-container">
                    {/* game content will be rendered here by Phaser */}
                </div>
            ) : (
                <StartPage onStart={handleStart}/>
            )}
            <Footer/>
        </div>
    );
};

export default App;

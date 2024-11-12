import React, {useState} from 'react';
import StartPage from './StartPage';
import Footer from "./Footer";

const App: React.FC = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [playerName, setPlayerName] = useState<string | null>(null);

    const handleStart = (playerName: string) => {
        setGameStarted(true);
        setPlayerName(playerName);
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {gameStarted ? (
                /* TODO replace with game scene */
                <div className="game-container">
                    <h2>Game Started for {playerName}!</h2>
                </div>
            ) : (
                <StartPage onStart={handleStart}/>
            )}
            <Footer/>
        </div>
    );
};

export default App;

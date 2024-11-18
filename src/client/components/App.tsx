import React, {useState} from 'react';
import StartPage from './StartPage';
import LobbyPage from './LobbyPage';
import Footer from "./Footer";
import Header from "./Header";
import GamePage from "./GamePage";

const App: React.FC = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [inLobby, setInLobby] = useState(false);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const handleStart = (playerId: string, playerName: string) => {
        setPlayerId(playerId);
        setPlayerName(playerName);
        setInLobby(true);
    };

    const handleJoinGame = (sessionId: string) => {
        setSessionId(sessionId);
    };

    const handleGameStart=() => {
        setGameStarted(true);
    };

    return (
        <div className="d-flex flex-column vh-100 bg-dark text-white">
            <Header playerId={playerId} playerName={playerName} sessionId={sessionId} />
            {gameStarted ? ( // when game was started -> show the game
                <GamePage />
            ) : inLobby ? ( // when in lobby, but game not started -> show lobby
                <LobbyPage playerId={playerId!} playerName={playerName!} onJoinGame={handleJoinGame} onGameStart={handleGameStart}/>
            ) : (
                <StartPage onStart={handleStart}/>
            )}
            <Footer/>
        </div>
    );
};

export default App;
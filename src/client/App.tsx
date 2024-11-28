import React, {useEffect, useState} from 'react';
import StartPage from './pages/StartPage';
import LobbyPage from './pages/LobbyPage';
import Footer from "./components/Footer";
import Header from "./components/Header";
import GamePage from "./pages/GamePage";
import {Player} from "../shared/model/Player";
import {PlayerRoleEnum} from "../shared/constants/PlayerRoleEnum";
import {useGameSessionSocket} from "./components/GameSessionSocketContext";
import LoadingOverlay from "./components/LoadingOverlay";

const App: React.FC = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const {socket, isConnected} = useGameSessionSocket();
    const [gameReady, setGameReady] = useState(false);
    const [inLobby, setInLobby] = useState(false);
    const [player, setPlayer] = useState<Player>(null);

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleStart = (playerName: string, color: string) => {
        const newPlayer = new Player(socket.id, playerName, color, PlayerRoleEnum.HOST);
        setPlayer(newPlayer);
        setInLobby(true); // transition to the lobby
    };

    const handleGameReady = () => {
        setGameReady(true);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={`app ${theme}`}>
            {!isConnected && <LoadingOverlay/>}
            <Header player={player} theme={theme} toggleTheme={toggleTheme}/>
            {gameReady ? ( // when game is ready -> show the game
                <GamePage/>
            ) : inLobby ? ( // when in lobby, but game not ready -> show lobby
                <LobbyPage
                    player={player!}
                    onGameReady={handleGameReady}/>
            ) : (
                <StartPage onStart={handleStart}/>
            )}
            <Footer/>
        </div>
    );
};

export default App;
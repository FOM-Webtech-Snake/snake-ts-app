import React, {useEffect, useRef, useState} from 'react';
import StartPage from './pages/StartPage';
import LobbyPage from './pages/LobbyPage';
import Footer from "./components/Footer";
import Header from "./components/Header";
import GamePage from "./pages/GamePage";
import {Player} from "../shared/model/Player";
import {PlayerRoleEnum} from "../shared/constants/PlayerRoleEnum";
import {useGameSessionSocket} from "./components/GameSessionContext";
import LoadingOverlay from "./components/LoadingOverlay";
import {useTheme} from "./components/ThemeProvider";

const App: React.FC = () => {
    const {theme} = useTheme();
    const {playerId, isConnected, joinSession} = useGameSessionSocket();
    const [gameReady, setGameReady] = useState(false);
    const [inLobby, setInLobby] = useState(false);
    const [player, setPlayer] = useState<Player | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const footerRef = useRef<HTMLDivElement | null>(null);
    const [availableHeight, setAvailableHeight] = useState(0);

    const handleStart = (playerName: string, color: string, sessionId: string) => {
        if (playerId == null) {
            return;
        }
        const newPlayer = new Player(playerId, playerName, color, PlayerRoleEnum.HOST);
        setPlayer(newPlayer);
        setInLobby(true); // transition to the lobby

        if (sessionId) {
            joinSession(sessionId.trim(), newPlayer);
        }
    };

    const handleGameReady = () => {
        setGameReady(true);
    };

    const updateAvailableHeight = () => {
        const headerHeight = headerRef.current?.offsetHeight || 0;
        const footerHeight = footerRef.current?.offsetHeight || 0;
        const viewportHeight = window.innerHeight;

        setAvailableHeight(viewportHeight - headerHeight - footerHeight - 20); // 20 = marginTop in GamePage
    };

    useEffect(() => {
        updateAvailableHeight();

        // Event-Listener für Fenster-Resize
        window.addEventListener('resize', updateAvailableHeight);
        return () => {
            window.removeEventListener('resize', updateAvailableHeight);
        };
    }, []);

    return (
        <div className={`app ${theme}`}>
            {!isConnected && <LoadingOverlay/>}
            <Header ref={headerRef} player={player}/>
            {gameReady ? ( // when game is ready -> show the game
                <GamePage availableHeight={availableHeight}/>
            ) : inLobby ? ( // when in lobby, but game not ready -> show lobby
                <LobbyPage
                    player={player!}
                    onGameReady={handleGameReady}/>
            ) : (
                <StartPage onStart={handleStart}/>
            )}
            <Footer ref={footerRef}/>
        </div>
    );
};

export default App;
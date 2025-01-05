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
import logo from '../../public/assets/logo.svg';
import {useGameState} from "./components/GameStateContext";

const App: React.FC = () => {
    const {theme} = useTheme();
    const {playerId, isConnected, joinSession} = useGameSessionSocket();
    const {inLobby, setInLobby, gameReady, setGameReady} = useGameState();
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

        setAvailableHeight(viewportHeight - headerHeight - footerHeight - 50);
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
            <div className="content" style={{
                backgroundImage: `url(${logo})`,
                backgroundSize: "cover", // Hintergrund proportional abdecken
                backgroundPosition: "center", // Hintergrund zentrieren
                backgroundRepeat: "repeat", // Keine Wiederholung
            }}>
                {gameReady ? ( // when game is ready -> show the game
                    <GamePage availableHeight={availableHeight}/>
                ) : inLobby ? ( // when in lobby, but game not ready -> show lobby
                    <LobbyPage
                        player={player!}
                        onGameReady={handleGameReady}/>
                ) : (
                    <StartPage onStart={handleStart}/>
                )}
            </div>
            <Footer ref={footerRef}/>
        </div>
    );
};

export default App;
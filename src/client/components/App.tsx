import React, {useState} from 'react';
import StartPage from './StartPage';
import LobbyPage from './LobbyPage';
import Footer from "./Footer";
import Header from "./Header";
import GamePage from "./GamePage";
import {Player} from "../../shared/Player";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import {useGameSessionSocket} from "./GameSessionSocketContext";

const App: React.FC = () => {
    const {socket, isConnected} = useGameSessionSocket();
    const [gameReady, setGameReady] = useState(false);
    const [inLobby, setInLobby] = useState(false);
    const [player, setPlayer] = useState<Player>(null);

    const handleStart = (playerName: string) => {
        const newPlayer = new Player(socket.id, playerName, PlayerRoleEnum.HOST);
        setPlayer(newPlayer);
        setInLobby(true); // transition to the lobby
    };

    const handleGameReady = () => {
        setGameReady(true);
    };

    return (
        <div className="d-flex flex-column vh-100 bg-dark text-white">

            {/* TODO extract to component */}
            {!isConnected && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                        <div className="spinner-border text-white mb-3" role="status">
                            <span className="visually-hidden">Connecting...</span>
                        </div>
                        <p>Connecting...</p>
                    </div>
                </div>
            )}


            <Header playerName={player?.getName()}/>
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
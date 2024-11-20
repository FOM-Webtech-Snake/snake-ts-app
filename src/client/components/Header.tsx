import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useGameSessionSocket} from "./GameSessionSocketContext";

interface HeaderProps {
    playerName: string | null;
}

const Header: React.FC<HeaderProps> = ({playerName}) => {

    const {socket, session} = useGameSessionSocket()

    return (
        <header className="d-flex justify-content-between align-items-center p-2 bg-secondary text-white">
            <div>
                {playerName && <span><strong>Player Name: </strong>{playerName}</span>}
                <div className="text-muted small">
                    {socket?.id && <span>Player ID: {socket?.id}</span>}
                </div>
            </div>
            <div>
                {session?.getId() && <span><strong>Session ID: </strong>{session?.getId()}</span>}
            </div>
        </header>
    );
};

export default Header;
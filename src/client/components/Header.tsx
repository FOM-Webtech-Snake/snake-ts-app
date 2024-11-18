import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface HeaderProps {
    sessionId: string | null;
    playerName: string | null;
    playerId: string | null;
}

const Header: React.FC<HeaderProps> = ({sessionId, playerName, playerId}) => {
    return (
        <header className="d-flex justify-content-between align-items-center p-2 bg-secondary text-white">
            <div>
                {playerName && <span><strong>Player Name: </strong>{playerName}</span>}
                <div className="text-muted small">
                    {playerId && <span>Player ID: {playerId}</span>}
                </div>
            </div>
            <div>
                {sessionId && <span><strong>Session ID: </strong>{sessionId}</span>}
            </div>
        </header>
    );
};

export default Header;
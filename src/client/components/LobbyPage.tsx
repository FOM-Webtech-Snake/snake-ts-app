import React, {useEffect, useRef, useState} from 'react';

interface LobbyPageProps {
    playerId: string;
    playerName: string;
    onJoinGame: (sessionId: string) => void;
    onGameStart: () => void;
}

const LobbyPage: React.FC<LobbyPageProps> = ({playerId, playerName, onJoinGame, onGameStart}) => {
    const [sessionId, setSessionId] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleJoin = async () => {
        if (sessionId.trim()) {

            try {
                const response = await fetch(`/api/lobby/join`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({sessionId: sessionId, playerId: playerId})
                });

                if (!response.ok) {
                    throw new Error('Failed to join session');
                }
                const data = await response.json();
                setSessionId(data.id);
                onJoinGame(data.id); // Auto join newly created session
                onGameStart(); // TODO don't start immediately
            } catch (error) {
                alert(`Error: ${(error as Error).message}`);
            }
        } else {
            alert('Please enter a session code to join an existing game!');
        }
    };

    const handleCreateSession = async () => {
        try {
            const response = await fetch(`/api/lobby/create`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({playerId: playerId})
            });
            if (!response.ok) {
                throw new Error('Failed to create a new session');
            }
            const data = await response.json();
            setSessionId(data.id);
            onJoinGame(data.id); // Auto join newly created session
            onGameStart(); // TODO don't start immediately
        } catch (error) {
            alert(`Error: ${(error as Error).message}`);
        }
    };

    const handleButtonClick = () => {
        if (sessionId.trim()) {
            handleJoin();
        } else {
            handleCreateSession();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleButtonClick();
        }
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white">
            <h1 className="mb-4">Welcome to the Lobby, {playerName}!</h1>
            <div className="input-container text-center mb-3">
                <label htmlFor="sessionCode" className="form-label">Session Code</label>
                <input
                    type="text"
                    id="sessionCode"
                    className="form-control text-center"
                    placeholder="Enter session code to join"
                    value={sessionId ? sessionId : ""}
                    onChange={(e) => setSessionId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                    style={{maxWidth: '300px'}}
                />
            </div>
            <button
                className="btn btn-primary btn-lg"
                onClick={handleButtonClick}
            >
                {sessionId.trim() ? 'Join Session' : 'Create New Session'}
            </button>
        </div>
    );
};

export default LobbyPage;
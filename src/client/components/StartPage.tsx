import React, {useState, useRef, useEffect} from "react";

interface StartPageProps {
    onStart: (playerName: string, sessionId?: string) => void;
}

const StartPage: React.FC<StartPageProps> = ({onStart}) => {
    const [playerName, setPlayerName] = useState("");
    const [sessionId, setSessionId] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleStart = () => {
        if (playerName.trim()) {
            onStart(playerName);
        } else {
            alert("Please enter your name");
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleStart();
        }
    };

    useEffect(() => {
        // Focus the input field when the component loads
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <h1 className="mb-4">Welcome to Snake Extreme!</h1>
            <div className="input-container text-center mb-3">
                <label htmlFor="playerName" className="form-label">Player Name</label>
                <input
                    type="text"
                    id="playerName"
                    className="form-control text-center"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={inputRef} // Attach the ref for focusing
                    style={{maxWidth: '300px'}}
                />
            </div>
            <div className="input-container text-center mb-4">
                <label htmlFor="sessionId" className="form-label">Session ID (optional)</label>
                <input
                    type="text"
                    id="sessionId"
                    className="form-control text-center"
                    placeholder="Enter session ID to join"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{maxWidth: '300px'}}
                />
            </div>
            {sessionId.trim() ? (
                <button
                    className="btn btn-primary btn-lg"
                    onClick={handleStart}
                >
                    Join Session
                </button>
            ) : (
                <button
                    className="btn btn-success btn-lg"
                    onClick={handleStart}
                >
                    Create Session
                </button>
            )}
        </div>
    );
};

export default StartPage;

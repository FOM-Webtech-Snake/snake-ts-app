import React, {useState, useRef, useEffect} from "react";

interface StartPageProps {
    onStart: (playerName: string) => void;
}

const StartPage: React.FC<StartPageProps> = ({onStart}) => {
    const [playerName, setPlayerName] = useState("");
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
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <h1 className="mb-4">Welcome to Snake Extreme!</h1>
            <div className="input-container text-center mb-3">
                <div className="input-group">
                    <span className="input-group-text"><i className="fa fa-user"></i></span>
                    <div className="form-floating">
                        <input
                            type="text"
                            id="playerName"
                            className="form-control"
                            placeholder="Enter your name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            ref={inputRef}
                            style={{maxWidth: '300px'}}
                        />
                        <label htmlFor="playerName">Player Name</label>
                    </div>
                </div>
            </div>
            <button
                className="btn btn-primary btn-lg"
                onClick={handleStart}
            >
                Start
            </button>
        </div>
    );
};

export default StartPage;
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

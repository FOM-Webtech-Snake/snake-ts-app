import React, {createContext, useContext, useState} from 'react';

interface GameStateContextType {
    inLobby: boolean;
    setInLobby: (value: boolean) => void;
    gameReady: boolean;
    setGameReady: (value: boolean) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [inLobby, setInLobby] = useState(false);
    const [gameReady, setGameReady] = useState(false);

    const value = {
        inLobby,
        setInLobby,
        gameReady,
        setGameReady,
    };

    return (
        <GameStateContext.Provider value={value}>
            {children}
        </GameStateContext.Provider>
    );
};

export const useGameState = () => {
    const context = useContext(GameStateContext);
    if (context === undefined) {
        throw new Error('useGameState must be used within a GameStateProvider');
    }
    return context;
};
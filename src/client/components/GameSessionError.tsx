import React from 'react';
import Alert from 'react-bootstrap/Alert';
import {useGameSessionSocket} from "./GameSessionContext";

const GameSessionError = () => {
    const {error, clearError} = useGameSessionSocket();

    if (!error) return null;

    return (
        <Alert
            variant="danger"
            dismissible
            onClose={clearError}
            className="mt-3"
        >
            {error}
        </Alert>
    );
};

export default GameSessionError;
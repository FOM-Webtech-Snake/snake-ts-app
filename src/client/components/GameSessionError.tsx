import React from 'react';
import { useGameSessionSocket } from "./GameSessionContext";

const ErrorModal = ({ error, onClose }) => (
    <div className="modal fade show d-block" role="dialog">
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                    <h5 className="modal-title">Fehler</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                </div>
                <div className="modal-body">
                    <p className="text-danger">{error}</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const GameSessionError = () => {
    const { error, clearError } = useGameSessionSocket();

    if (!error) return null;

    return <ErrorModal error={error} onClose={clearError} />;
};

export default GameSessionError;

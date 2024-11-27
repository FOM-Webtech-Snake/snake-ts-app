import React from "react";

const LoadingOverlay: React.FC<{ message?: string }> = ({message = "Connecting..."}) => (
    <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex align-items-center justify-content-center"
    >
        <div className="text-center">
            <div className="spinner-border text-white mb-3" role="status">
                <span className="visually-hidden">{message}</span>
            </div>
            <p>{message}</p>
        </div>
    </div>
);

export default LoadingOverlay;
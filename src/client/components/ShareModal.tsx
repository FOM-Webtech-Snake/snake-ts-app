import React from "react";
import {Button, Modal} from "react-bootstrap";
import {QRCodeSVG} from "qrcode.react";

interface ShareInfoModalProps {
    show: boolean;
    onClose: () => void;
    sessionId: string;
    theme: string;
}

const ShareInfoModal: React.FC<ShareInfoModalProps> = ({show, onClose, sessionId, theme}) => {
    const shareUrl = `${window.location.origin}?sessionId=${sessionId}`;

    return (
        <Modal show={show} onHide={onClose} centered backdrop="static">
            <Modal.Header
                closeButton
                className={theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}>
                <Modal.Title>Share Session</Modal.Title>
            </Modal.Header>
            <Modal.Body className={theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}>
                <div className="text-center">
                    <p>Share the session with your friends using this QR code or the link below:</p>
                    <QRCodeSVG value={shareUrl} size={200} level="H"/>
                    <p className="mt-3">
                        <strong>Session ID:</strong> {sessionId}
                    </p>
                    <p>
                        <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                            {shareUrl}
                        </a>
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer className={theme === 'light' ? 'bg-light' : 'bg-dark'}>
                <Button variant={theme === 'light' ? 'secondary' : 'light'} onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShareInfoModal;

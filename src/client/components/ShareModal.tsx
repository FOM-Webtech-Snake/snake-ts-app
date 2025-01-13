import React from "react";
import {Button, Modal} from "react-bootstrap";
import {QRCodeSVG} from "qrcode.react";
import {useTheme} from "./ThemeProvider";

interface ShareModalProps {
    show: boolean;
    onClose: () => void;
    sessionId: string;
}

const ShareModal: React.FC<ShareModalProps> = ({show, onClose, sessionId}) => {
    const {theme} = useTheme();
    const shareUrl = `${window.location.origin}?sessionId=${sessionId}`;

    return (
        <Modal className={`modal ${theme}`} show={show} onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Share Session</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShareModal;

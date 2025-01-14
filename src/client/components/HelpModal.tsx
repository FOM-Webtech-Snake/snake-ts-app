import React from "react";
import {Button, Modal} from "react-bootstrap";
import {useTheme} from "./ThemeProvider";

interface HelpModalProps {
    show: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({show, onClose}) => {
    const {theme} = useTheme();

    return (
        <Modal className={`modal ${theme}`} show={show} onHide={onClose} centered backdrop="static" size={"lg"}>
            <Modal.Header closeButton>
                <Modal.Title>How to Play</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <table className={`table ${theme}`}>
                    <thead>
                    <tr>
                        <th>Control</th>
                        <th><h5><i className={"fa fa-keyboard"}/> Keyboard</h5></th>
                        <th><h5><i className={"fa fa-hand"}/> Touch</h5></th>
                        <th><h5><i className={"fa fa-gamepad"}/> Controller</h5></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Movement</td>
                        <td>Up, Down, Left, Right</td>
                        <td>Swipe Up, Swipe Down, Swipe Left, Swipe Right</td>
                        <td>D-Pad Up, D-Pad Down, D-Pad Left, D-Pad Right</td>
                    </tr>
                    <tr>
                        <td>Start Game</td>
                        <td>Space</td>
                        <td>Tap</td>
                        <td>A-Button</td>
                    </tr>
                    <tr>
                        <td>Pause</td>
                        <td>P</td>
                        <td>Long Tap</td>
                        <td>Start</td>
                    </tr>
                    </tbody>
                </table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default HelpModal;

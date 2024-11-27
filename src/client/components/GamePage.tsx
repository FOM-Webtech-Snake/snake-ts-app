import React, {useEffect, useRef} from 'react';
import {GameUtil} from '../game/util/GameUtil';
import {ConfigUtil} from '../game/util/ConfigUtil';
import {useGameSessionSocket} from "./GameSessionSocketContext";
import {Col, Container, Row} from "react-bootstrap";
import PlayerList from "./PlayerList";
import TimerDisplay from "./TimerDisplay";


interface GamePageProps {
}

const GamePage: React.FC<GamePageProps> = ({}) => {
    const {socket} = useGameSessionSocket();
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const gameCreatedRef = useRef(false);

    useEffect(() => {
        if (gameContainerRef.current && !gameCreatedRef.current) {
            const gameContainer = gameContainerRef.current;
            const {width, height} = gameContainer.getBoundingClientRect(); // Get dynamic width and height
            let gameConfig = ConfigUtil.createPhaserGameConfig(
                width,
                height,
                "game-container"
            );
            const game = GameUtil.createGame(
                gameConfig,
                socket,
            );
            gameCreatedRef.current = true;
        }
    }, []);

    return (
        <Container fluid className="vh-100 d-flex flex-column">
            <Row className={"flex-grow-1"}>
                <Col xs={12} md={9} className="d-flex justify-content-center align-items-center">
                    <div id="game-container" ref={gameContainerRef} style={{width: '100%', height: '100%'}}>
                        {/* game content will be rendered here by Phaser */}
                    </div>
                </Col>
                <Col xs={12} md={3} className="d-none d-md-flex flex-column">
                    <PlayerList/>
                    <TimerDisplay/>
                </Col>
            </Row>
        </Container>
    );
};

export default GamePage;
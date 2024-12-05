import React, {useEffect, useRef} from 'react';
import {GameUtil} from '../game/util/GameUtil';
import {ConfigUtil} from '../game/util/ConfigUtil';
import {useGameSessionSocket} from "../components/GameSessionSocketContext";
import {Col, Container, Row} from "react-bootstrap";
import PlayerList from "../components/PlayerList";
import TimerDisplay from "../components/TimerDisplay";


interface GamePageProps {
    availableHeight: number;
}

const GamePage: React.FC<GamePageProps> = ({availableHeight}) => {
    const {socket} = useGameSessionSocket();
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const gameCreatedRef = useRef(false);
    const gameInstanceRef = useRef<any>(null);

    const resizeGame = () => {
        if (gameContainerRef.current && gameInstanceRef.current) {
            const gameContainer = gameContainerRef.current;
            const {width, height} = gameContainer.getBoundingClientRect();
            gameInstanceRef.current.scale.resize(width, height);
        }
    };

    useEffect(() => {
        if (gameContainerRef.current && !gameCreatedRef.current) {
            const gameContainer = gameContainerRef.current;
            const {width, height} = gameContainer.getBoundingClientRect(); // Get dynamic width and height
            let gameConfig = ConfigUtil.createPhaserGameConfig(
                width,
                availableHeight,
                "game-container"
            );
            const game = GameUtil.createGame(
                gameConfig,
                socket,
            );
            gameCreatedRef.current = true;
        }

        // Event-Listener resize
        window.addEventListener('resize', resizeGame);

        return () => {
            window.removeEventListener('resize', resizeGame);
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
            }
        };
    }, [availableHeight]);

    return (
        <Container className="vh-100 d-flex flex-column justify-content-center">
            <Row className="flex-grow-1">
                <Col className="col-8">
                    <div id="game-container" ref={gameContainerRef}
                         style={{
                             width: '100%',
                             height: `${availableHeight}px`,
                             marginTop: '20px',
                         }}>
                        {/* game content will be rendered here by Phaser */}
                    </div>
                </Col>
                <Col className="col-4">
                    <TimerDisplay/>
                    <PlayerList/>
                </Col>
            </Row>
        </Container>
    );
}

export default GamePage;
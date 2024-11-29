import React, {useEffect, useRef} from 'react';
import {GameUtil} from '../game/util/GameUtil';
import {ConfigUtil} from '../game/util/ConfigUtil';
import {useGameSessionSocket} from "../components/GameSessionSocketContext";
import {Col, Container, Row} from "react-bootstrap";
import PlayerList from "../components/PlayerList";
import TimerDisplay from "../components/TimerDisplay";


interface GamePageProps {
    theme: string;
}

const GamePage: React.FC<GamePageProps> = ({theme}) => {
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
        <>
            <Container className="vh-100 d-flex flex-column justify-content-center">
                <Row className="flex-grow-1">
                    <Col className="col-8">
                        <div id="game-container" ref={gameContainerRef}
                             style={{width: '100%', height: '90%'}}>
                            {/* game content will be rendered here by Phaser */}
                        </div>
                    </Col>
                    <Col className="col-4">
                        <TimerDisplay/>
                        <PlayerList theme={theme}/>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default GamePage;
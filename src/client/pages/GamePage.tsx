import React, {useEffect, useRef, useCallback} from 'react';
import {GameUtil} from '../game/util/GameUtil';
import {ConfigUtil} from '../game/util/ConfigUtil';
import {Col, Container, Row} from "react-bootstrap";
import PlayerList from "../components/PlayerList";
import TimerDisplay from "../components/TimerDisplay";
import GameControl from "../components/GameControl";
import {getLogger} from "../../shared/config/LogConfig";
import DeathDisplay from "../components/DeathDisplay";

interface GamePageProps {
    availableHeight: number;
}

const log = getLogger("client.components.GamePage");

const GamePage: React.FC<GamePageProps> = ({availableHeight}) => {
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const gameInstanceRef = useRef<any>(null);

    const resizeGame = useCallback(() => {
        if (gameContainerRef.current && gameInstanceRef.current) {
            const gameContainer = gameContainerRef.current;
            const {width, height} = gameContainer.getBoundingClientRect();
            gameInstanceRef.current.scale.resize(width, height);
        }
    }, []);

    useEffect(() => {
        if (gameContainerRef.current && !gameInstanceRef.current) {
            const gameContainer = gameContainerRef.current;
            const {width, height} = gameContainer.getBoundingClientRect(); // Get dynamic width and height
            gameInstanceRef.current = GameUtil.createGame(
                ConfigUtil.createPhaserGameConfig(
                    width,
                    availableHeight,
                    "game-container"
                )
            );
            log.debug("game instance created");
        }

        // Event-Listener resize
        window.addEventListener('resize', resizeGame);

        return () => {
            window.removeEventListener('resize', resizeGame);
            if (gameInstanceRef.current) {
                log.debug("Destroying game instance...");
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, [resizeGame]);

    return (
        <Container className="vh-100 d-flex flex-column justify-content-center">
            <Row className="flex-grow-1">
                <Col className="col-12 col-md-8 mt-4">
                    <div id="game-container" ref={gameContainerRef}
                         style={{
                             width: '100%',
                             height: `${availableHeight}px`,
                         }}>
                        {/* game content will be rendered here by Phaser */}
                    </div>
                </Col>
                <Col className="col-md-4">
                    <GameControl/>
                    <TimerDisplay/>
                    <PlayerList/>
                    <DeathDisplay/>
                </Col>
            </Row>
        </Container>
    );
};

export default GamePage;
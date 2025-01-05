import {Server} from "socket.io";
import {GameSession} from "../shared/model/GameSession";
import {SocketEvents} from "../shared/constants/SocketEvents";
import {GameStateEnum} from "../shared/constants/GameStateEnum";
import {getLogger} from "../shared/config/LogConfig";

const log = getLogger("server.util.GameTimerManager");

export class GameTimerManager {
    private static instance: GameTimerManager;
    private io: Server;
    private countdownTimers: Map<string, NodeJS.Timeout>;
    private gameTimers: Map<string, NodeJS.Timeout>;

    constructor(io: Server) {
        this.io = io;
        this.countdownTimers = new Map();
        this.gameTimers = new Map();
    }

    public static getInstance(io?: Server): GameTimerManager {
        if (!GameTimerManager.instance) {
            if (!io) {
                throw new Error(
                    "GameTimerManager has not been initialized yet. You need to provide a Server instance on first call."
                );
            }
            GameTimerManager.instance = new GameTimerManager(io);
        }
        return GameTimerManager.instance;
    }

    startCountdown(gameSession: GameSession, onCountdownEnd: () => void): void {
        if (gameSession.getIsCountdownRunning()) {
            log.warn(`Countdown for game session ${gameSession.getId()} is already running.`);
            return;
        }

        let countdown = 3;
        gameSession.setIsCountdownRunning(true);

        const countdownInterval = setInterval(() => {
            this.io.to(gameSession.getId()).emit(SocketEvents.GameControl.COUNTDOWN_UPDATED, countdown);

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.countdownTimers.delete(gameSession.getId());
                onCountdownEnd();
                gameSession.setIsCountdownRunning(false);
            } else {
                countdown--;
            }
        }, 1000);

        this.countdownTimers.set(gameSession.getId(), countdownInterval);
    }

    stopCountdown(gameSession: GameSession): void {
        const countdownTimer = this.countdownTimers.get(gameSession.getId());
        if (countdownTimer) {
            clearInterval(countdownTimer);
            this.countdownTimers.delete(gameSession.getId());
            gameSession.setIsCountdownRunning(false);
            log.debug(`Countdown for game session ${gameSession.getId()} stopped.`);
        } else {
            log.warn(`No countdown found for game session ${gameSession.getId()}.`);
        }
    }

    startGameTimer(gameSession: GameSession): void {
        if (this.gameTimers.has(gameSession.getId())) {
            log.warn(`Game timer for session ${gameSession.getId()} is already running.`);
            return;
        }

        const intervalId = setInterval(() => {
            if (gameSession.getGameState() === GameStateEnum.RUNNING) {
                const remainingTime = gameSession.getRemainingTime() - 1;
                gameSession.setRemainingTime(remainingTime);

                log.debug(`Remaining time for session ${gameSession.getId()}: ${remainingTime}`);
                this.io.to(gameSession.getId()).emit(SocketEvents.GameEvents.TIMER_UPDATED, remainingTime);

                if (remainingTime <= 0) {
                    this.stopGameTimer(gameSession);
                    gameSession.setGameState(GameStateEnum.GAME_OVER);
                    this.io.to(gameSession.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
                    log.debug(`Game over for session ${gameSession.getId()}.`);
                }
            }
        }, 1000);

        this.gameTimers.set(gameSession.getId(), intervalId);
        gameSession.setTimerInterval(intervalId);
    }

    stopGameTimer(gameSession: GameSession): void {
        const gameTimer = this.gameTimers.get(gameSession.getId());
        if (gameTimer) {
            clearInterval(gameTimer);
            this.gameTimers.delete(gameSession.getId());
            gameSession.setTimerInterval(null);
            log.debug(`Game timer for session ${gameSession.getId()} stopped.`);
        } else {
            log.warn(`No game timer found for session ${gameSession.getId()}.`);
        }
    }
}

// src/util/GameTimerUtil.ts
import { Server } from "socket.io";
import { GameSession } from "../../shared/model/GameSession";
import { SocketEvents } from "../../shared/constants/SocketEvents";
import { GameStateEnum } from "../../shared/constants/GameStateEnum";
import { getLogger } from "../../shared/config/LogConfig";

const log = getLogger("server.util.GameTimerUtil");

export class GameTimerUtil {
    static startCountdown(io: Server, gameSession: GameSession, onCountdownEnd: () => void) {
        if (gameSession.getIsCountdownRunning()) {
            return;
        }

        let countdown = 3;
        gameSession.setIsCountdownRunning(true);

        const countdownInterval = setInterval(() => {
            io.to(gameSession.getId()).emit(SocketEvents.GameControl.COUNTDOWN_UPDATED, countdown);

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                onCountdownEnd();
                gameSession.setIsCountdownRunning(false);
            } else {
                countdown--;
            }
        }, 1000);
    }

    static startGameTimer(io: Server, gameSession: GameSession) {
        if (!gameSession.getTimerInterval()) {
            const intervalId = setInterval(() => {
                if (gameSession.getGameState() === GameStateEnum.RUNNING) {
                    const remainingTime = gameSession.getRemainingTime() - 1;
                    gameSession.setRemainingTime(remainingTime);

                    log.debug("remaining time", remainingTime);
                    io.to(gameSession.getId()).emit(SocketEvents.GameEvents.TIMER_UPDATED, remainingTime);

                    if (remainingTime <= 0) {
                        // stop timer
                        clearInterval(intervalId);
                        gameSession.setTimerInterval(null);
                        gameSession.setGameState(GameStateEnum.GAME_OVER);
                        io.to(gameSession.getId()).emit(SocketEvents.GameControl.STATE_CHANGED, gameSession.getGameState());
                        log.debug("Time expired!");
                    }
                }
            }, 1000); // every second

            gameSession.setTimerInterval(intervalId);
        }
    }
}

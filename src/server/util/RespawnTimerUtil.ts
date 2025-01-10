import {GameSession} from "../../shared/model/GameSession";
import {GameStateEnum} from "../../shared/constants/GameStateEnum";

export class RespawnTimerUtil {
    private startTime: number;
    private duration: number;
    private timeoutId: NodeJS.Timeout | null = null;
    private remainingTime: number;
    private callback: () => void;
    private gameSession: GameSession;

    constructor(gameSession: GameSession, duration: number, callback: () => void) {
        this.gameSession = gameSession;
        this.duration = duration;
        this.remainingTime = duration;
        this.callback = callback;
        this.startTime = Date.now();
    }

    start() {
        this.startTime = Date.now();
        this.tick();
    }

    private tick() {
        if (this.gameSession.getGameState() === GameStateEnum.RUNNING) {
            const elapsed = Date.now() - this.startTime;
            this.remainingTime = Math.max(0, this.duration - elapsed);

            if (this.remainingTime <= 0) {
                this.callback();
                return;
            }
        } else {
            this.duration = this.remainingTime;
            this.startTime = Date.now();
        }

        this.timeoutId = setTimeout(() => this.tick(), 100); // check all 100ms
    }

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    getRemainingTime(): number {
        return this.remainingTime;
    }
}
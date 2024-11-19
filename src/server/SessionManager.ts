import {GameSession} from "../shared/GameSession";
import {GameStateEnum} from "../shared/constants/GameStateEnum";
import {GameSessionConfig} from "../shared/GameSessionConfig";
import {Player} from "../shared/Player";


class SessionManager {
    private sessions: Record<string, GameSession> = {};

    getSession = (sessionId: string): GameSession | undefined => {
        return this.sessions[sessionId];
    }

    getAllSessions = (): Record<string, GameSession> => {
        return this.sessions;
    }

    createSession(player: Player, config: GameSessionConfig) {
        const newGame = new GameSession(null, player.getId(), config);
        newGame.addPlayer(player);
        this.sessions[newGame.getId()] = newGame;
        return newGame;
    }

    joinSession(sessionId: string, player: Player): GameSession {
        let session = this.getSession(sessionId);
        session.addPlayer(player);
        return session;
    }

    deleteSession(sessionId: string): void {
        delete this.sessions[sessionId];
    }

    getAvailableGames(): GameSession[] {
        return Object.values(this.sessions)
            .filter(session => session.getGameState() === GameStateEnum.WAITING_FOR_PLAYERS);
    }
}

export const sessionManager = new SessionManager();
import {GameSession} from "../shared/GameSession";
import {GameStateEnum} from "../shared/constants/GameStateEnum";


class SessionManager {
    private sessions: Record<string, GameSession> = {};

    getSession = (sessionId: string): GameSession | undefined => {
        return this.sessions[sessionId];
    }

    getAllSessions = (): Record<string, GameSession> => {
        return this.sessions;
    }

    createSession(playerId: string) {
        const newGame = new GameSession(null, playerId);
        newGame.addPlayer(playerId);
        this.sessions[newGame.getId()] = newGame;
        return newGame;
    }

    joinSession(sessionId: string, playerId: string): GameSession{
        let session = this.getSession(sessionId);
        session.addPlayer(playerId);
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
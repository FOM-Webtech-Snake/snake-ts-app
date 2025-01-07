import {GameSession} from "../shared/model/GameSession";
import {GameStateEnum} from "../shared/constants/GameStateEnum";
import {GameSessionConfig} from "../shared/model/GameSessionConfig";
import {Player} from "../shared/model/Player";
import {getLogger} from "../shared/config/LogConfig";
import SpawnerDaemon from "./SpawnerDaemon";
import {GameSessionUtil} from "./util/GameSessionUtil";
import {GameTimerManager} from "./GameTimerManager";

const log = getLogger("server.SessionManager");

class SessionManager {
    private playerSessions = new Map();
    private sessions: Record<string, GameSession> = {};
    private spawner = SpawnerDaemon.getInstance();

    getSession = (sessionId: string): GameSession | null => {
        return this.sessions[sessionId];
    }

    getAllSessions = (): GameSession[] => {
        return Object.values(this.sessions);
    }

    createSession(config: GameSessionConfig) {
        const newGame = new GameSession(GameSessionUtil.generateSessionId(), config);
        this.sessions[newGame.getId()] = newGame;
        log.debug(`new session created`);
        return newGame;
    }

    joinSession(sessionId: string, player: Player): GameSession {
        let session = this.getSession(sessionId);
        if (session == null) {
            log.warn(`session ${sessionId} not found`);
            throw new Error(`session ${sessionId} not found.`);
        }

        log.trace("current game session config", session.getConfig());
        if (session.getPlayerCount() >= session.getConfig().getMaxPlayers()) {
            log.warn(`max player count reached`, sessionId);
            throw new Error("max player count reached");
        }

        session.addPlayer(player);
        this.playerSessions.set(player.getId(), session.getId());
        return session;
    }

    getSessionIdByPlayerId(playerId: string): GameSession | null {
        const sessionId: string = this.playerSessions.get(playerId);
        if (sessionId != null) {
            return this.getSession(sessionId);
        }
        return null;
    }

    deleteSession(sessionId: string): void {
        this.spawner.stopSpawner(sessionId);

        // delete timer
        const gameTimerManager = GameTimerManager.getInstance();
        gameTimerManager.stopGameTimer(this.getSession(sessionId));

        delete this.sessions[sessionId];
        log.debug(`session ${sessionId} deleted`);
    }

    getAvailableGames(): GameSession[] {
        return Object.values(this.sessions)
            .filter(session => session.getGameState() === GameStateEnum.WAITING_FOR_PLAYERS);
    }
}

export const sessionManager = new SessionManager();
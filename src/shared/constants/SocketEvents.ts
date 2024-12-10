export namespace SocketEvents {
    export enum Configuration {
        GET_CONFIGURATION = "getConfiguration",
        CURRENT_CONFIGURATION = "currentConfiguration",
    }

    export enum Connection {
        JOIN_SESSION = "joinSession",
        CREATE_SESSION = "createSession",
        LEAVE_SESSION = "leaveSession",
        GET_AVAILABLE_SESSIONS = "getAvailableSessions",
        AVAILABLE_SESSIONS = "availableSessions",
        DISCONNECT = "disconnect",
        CONNECT = "connect",
        CONNECT_ERROR = "connect_error",
        CONNECTED = "connected",
        CONNECTION = "connection",
    }

    export enum GameControl {
        STATE_CHANGED = "stateChanged",
        START_GAME = "startGame",
        RESET_GAME = "resetGame",
        GET_READY = "getReady",
        PAUSE_GAME = "pauseGame",
        RESUME_GAME = "resumeGame",
        SYNC_GAME_STATE = "syncGameState",
        COUNTDOWN_UPDATED = "countdownUpdated",
    }

    export enum SessionState {
        CONFIG = "config",
        GET_CURRENT_SESSION = "getCurrentSession",
        CURRENT_SESSION = "currentSession",
        NEW_PLAYER = "newPlayer",
        LEFT_SESSION = "leftSession",
        PLAYER_JOINED = "playerJoined",
        PLAYER_LIST = "playerList",
        SESSION_UPDATED = "sessionUpdated",
        CONFIG_UPDATED = "configUpdated",
        DISCONNECTED = "disconnected",
    }

    export enum GameEvents {
        COLLECT_FOOD_ITEM = "collectFoodItem",
        FOOD_ITEM_COLLECTED = "foodItemCollected",
        SPAWN_FOOD_ITEM = "spawnFoodItem",
        COLLECTABLE_COLLECTED = "collectableCollected",
        SPAWN_NEW_COLLECTABLE = "spawnNewItem",
        SPAWN_NEW_OBSTACLE = "spawnNewObstacle",
        ITEM_SPAWNED = "itemSpawned",
        ITEM_COLLECTED = "itemCollected",
        TIMER_UPDATED = "timerUpdated",
        COLLISION = "collision"
    }

    export enum ClientState {
        READY = "ready",
    }

    export enum PlayerActions {
        PLAYER_READY = "playerReady",
        PLAYER_MOVEMENT = "playerMovement",
        PLAYER_MOVED = "playerMoved",
        PLAYER_DIED = "playerDied",
        PLAYER_RESPAWNED = "playerRespawned",
    }

    export enum GameStatus {
        STARTED_GAME = "startedGame",
        PAUSED_GAME = "pausedGame",
        RESUMED_GAME = "resumedGame",
    }
}

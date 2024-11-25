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
        GET_READY = "getReady",
        PAUSE_GAME = "pauseGame",
        RESUME_GAME = "resumeGame",
    }

    export enum SessionState {
        CONFIG = "config",
        GET_CURRENT_SESSION = "getCurrentSession",
        CURRENT_SESSION = "currentSession",
        NEW_PLAYER = "newPlayer",
        SESSION_UPDATED = "sessionUpdated",
        DISCONNECTED = "disconnected",
    }

    export enum GameEvents {
        COLLECT_FOOD_ITEM = "collectFoodItem",
        FOOD_ITEM_COLLECTED = "foodItemCollected",
        SPAWN_FOOD_ITEM = "spawnFoodItem",
        COLLECTABLE_COLLECTED = "collectableCollected",
        SPAWN_NEW_COLLECTABLE = "spawnNewItem",
        ITEM_SPAWNED = "itemSpawned",
        ITEM_COLLECTED = "itemCollected",
        COLLISION = "collision"
    }

    export enum PlayerActions {
        PLAYER_MOVEMENT = "playerMovement",
        PLAYER_MOVED = "playerMoved",
    }

    export enum GameStatus {
        STARTED_GAME = "startedGame",
        PAUSED_GAME = "pausedGame",
        RESUMED_GAME = "resumedGame",
    }
}

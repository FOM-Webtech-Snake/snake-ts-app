export namespace SocketEvents {
    export enum Connection {
        JOIN_SESSION = "joinSession",
        GET_AVAILABLE_SESSIONS = "getAvailableSessions",
        AVAILABLE_SESSIONS = "availableSessions",
        DISCONNECT = "disconnect",
        CONNECT = "connect",
        CONNECTED = "connected",
        CONNECTION = "connection"
    }

    export enum GameControl {
        START_GAME = "startGame",
        PAUSE_GAME = "pauseGame",
        RESUME_GAME = "resumeGame"
    }

    export enum SessionState {
        CONFIG = "config",
        CURRENT_SESSION = "currentSession",
        NEW_PLAYER = "newPlayer",
        DISCONNECTED = "disconnected"
    }

    export enum GameEvents {
        COLLECT_FOOD_ITEM = "collectFoodItem",
        FOOD_ITEM_COLLECTED = "foodItemCollected",
        SPAWN_FOOD_ITEM = "spawnFoodItem",
        COLLECTABLE_COLLECTED = "collectableCollected",
        SPAWN_NEW_COLLECTABLE = "spawnNewItem",
        ITEM_SPAWNED = "itemSpawned"
    }

    export enum PlayerActions {
        PLAYER_MOVEMENT = "playerMovement",
        PLAYER_MOVED = "playerMoved"
    }

    export enum GameStatus {
        STARTED_GAME = "startedGame",
        PAUSED_GAME = "pausedGame",
        RESUMED_GAME = "resumedGame"
    }
}

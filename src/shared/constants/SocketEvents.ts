export namespace SocketEvents {

    export enum Connection {
        CONNECTION = "connection",
        JOIN_SESSION = "joinSession",
        CREATE_SESSION = "createSession",
        LEAVE_SESSION = "leaveSession",
        DISCONNECT = "disconnect",
    }

    export enum SessionEvents {
        PLAYER_JOINED = "playerJoined",
        LEFT_SESSION = "leftSession",
        CONFIG_UPDATED = "configUpdated",
        PLAYER_COLOR_CHANGED = "playerColorChanged",
        DISCONNECTED = "disconnected",
    }

    export enum GameControl {
        START_GAME = "startGame",
        RESET_GAME = "resetGame",
        GET_READY = "getReady",
        STATE_CHANGED = "stateChanged",
        SYNC_GAME_STATE = "syncGameState",
        COUNTDOWN_UPDATED = "countdownUpdated",
    }

    export enum GameEvents {
        SPAWN_NEW_COLLECTABLE = "spawnNewItem",
        SPAWN_NEW_OBSTACLE = "spawnNewObstacle",
        ITEM_COLLECTED = "itemCollected",
        COLLISION = "collision",
        TIMER_UPDATED = "timerUpdated"
    }

    export enum PlayerActions {
        PLAYER_MOVEMENT = "playerMovement",
        PLAYER_DIED = "playerDied",
        PLAYER_RESPAWNED = "playerRespawned",
    }

    export enum ClientState {
        READY = "ready",
    }
}

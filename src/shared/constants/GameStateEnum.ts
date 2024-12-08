export enum GameStateEnum {
    WAITING_FOR_PLAYERS = "waitingForPlayers", // lobby
    READY = "ready", // all players ready to start (game loaded)
    RUNNING = "running", // game running
    PAUSED = "paused", // game paused
    GAME_OVER = "gameOver", // game over
}
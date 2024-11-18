export class GameSessionConfig {
    private maxPlayers: number;
    private size: { height: number, width: number };

    constructor(maxPlayers: number, size: { height: number, width: number }) {
        this.maxPlayers = maxPlayers;
        this.size = size;
    }

    toJson() {
        return JSON.stringify({
            maxPlayers: this.maxPlayers,
            size: this.size,
        });
    }

    static fromJson(json: string) {
        const data = JSON.parse(json);
        return new GameSessionConfig(data.maxPlayers, data.size);
    }
}

export const DEFAULT_GAME_SESSION_CONFIG = new GameSessionConfig(4, {height: 1600, width: 1600});
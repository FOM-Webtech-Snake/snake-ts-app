export class GameSessionConfig {
    private maxPlayers: number;
    private size: { height: number, width: number };

    constructor(maxPlayers: number, size: { height: number, width: number }) {
        this.maxPlayers = maxPlayers;
        this.size = size;
    }

    getMaxPlayers(): number {
        return this.maxPlayers;
    }

    getSize(): { height: number, width: number } {
        return this.size;
    }

    getWidth(): number {
        return this.size.width;
    }

    getHeight(): number {
        return this.size.height;
    }

    toJson() {
        return JSON.stringify({
            maxPlayers: this.maxPlayers,
            size: this.size,
        });
    }

    static fromData(data: any) {
        return new GameSessionConfig(data.maxPlayers, data.size);
    }

    static fromJson(json: string) {
        const data = JSON.parse(json);
        return this.fromData(data);
    }
}

export const DEFAULT_GAME_SESSION_CONFIG = new GameSessionConfig(4, {height: 1600, width: 1600});
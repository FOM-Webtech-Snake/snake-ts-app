import {Size} from "./model/Size";
import {getLogger} from "./config/LogConfig";

const log = getLogger("shared.GameSessionConfig");

export class GameSessionConfig {
    private maxPlayers: number;
    private size: Size;

    constructor(maxPlayers: number, size: Size) {
        this.maxPlayers = maxPlayers;
        this.size = size;
    }

    getMaxPlayers(): number {
        return this.maxPlayers;
    }

    getSize(): Size {
        return this.size;
    }

    toJson() {
        return {
            maxPlayers: this.maxPlayers,
            size: this.size.toJSON(),
        };
    }

    static fromData(data: any) {
        log.info("fromData", data);
        return new GameSessionConfig(data.maxPlayers, Size.fromData(data.size));
    }
}

export const DEFAULT_GAME_SESSION_CONFIG = new GameSessionConfig(4, new Size(1600, 1600));
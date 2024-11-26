import {Size} from "./model/Size";
import {getLogger} from "./config/LogConfig";

const log = getLogger("shared.GameSessionConfig");

export class GameSessionConfig {
    private maxPlayers: number;
    private size: Size;
    private worldCollisionEnabled: boolean;
    private selfCollisionEnabled: boolean;
    private playerToPlayerCollisionEnabled: boolean;

    constructor(maxPlayers: number, size: Size, worldCollisionEnabled: boolean, selfCollisionEnabled: boolean, playerToPlayerCollisionEnabled: boolean) {
        this.maxPlayers = maxPlayers;
        this.size = size;
        this.worldCollisionEnabled = worldCollisionEnabled;
        this.selfCollisionEnabled = selfCollisionEnabled;
        this.playerToPlayerCollisionEnabled = playerToPlayerCollisionEnabled;
    }

    getWorldCollisionEnabled(): boolean {
        return this.worldCollisionEnabled;
    }

    getSelfCollisionEnabled(): boolean {
        return this.selfCollisionEnabled;
    }

    getPlayerToPlayerCollisionEnabled(): boolean {
        return this.playerToPlayerCollisionEnabled;
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
            worldCollisionEnabled: this.worldCollisionEnabled,
            selfCollisionEnabled: this.selfCollisionEnabled,
            playerToPlayerCollisionEnabled: this.playerToPlayerCollisionEnabled,
        };
    }

    static fromData(data: any) {
        log.debug("fromData", data);
        return new GameSessionConfig(data.maxPlayers, Size.fromData(data.size), data.worldCollisionEnabled, data.selfCollisionEnabled, data.playerToPlayerCollisionEnabled);
    }
}

export const DEFAULT_GAME_SESSION_CONFIG = new GameSessionConfig(4, new Size(1600, 1600), true, false, true);
import {PlayerStatusEnum} from "./constants/PlayerStatusEnum";
import {PlayerRoleEnum} from "./constants/PlayerRoleEnum";
import {getLogger} from "./config/LogConfig";
import {Position} from "./model/Position";

const log = getLogger("shared.Player");

export class Player {
    private id: string;
    private name: string;
    private color: string;
    private status: PlayerStatusEnum;
    private role: PlayerRoleEnum;
    private score: number;
    private bodyPositions: Position[];

    // TODO change the default status for a player when lobby is implemented
    constructor(id: string,
                name: string,
                color: string,
                role: PlayerRoleEnum,
                status: PlayerStatusEnum = PlayerStatusEnum.READY,
                score: number = 0,
                bodyPositions: Position[] = []) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.status = status;
        this.role = role;
        this.score = score;
        this.bodyPositions = bodyPositions;
    }

    getId() {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getColor(): string {
        return this.color;
    }

    getBodyPositions(): Position[] {
        return this.bodyPositions;
    }

    setBodyPositions(bodyPositions: Position[]) {
        this.bodyPositions = bodyPositions;
    }

    setName(name: string): void {
        this.name = name;
    }

    getStatus(): PlayerStatusEnum {
        return this.status;
    }

    setStatus(status: PlayerStatusEnum): void {
        this.status = status;
    }

    getRole(): PlayerRoleEnum {
        return this.role;
    }

    setRole(newRole: PlayerRoleEnum) {
        this.role = newRole;
    }

    getScore() {
        return this.score;
    }

    addScore(value: number): number {
        this.score += value;
        return this.score;
    }

    toJson() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            role: this.role,
            status: this.status,
            score: this.score,
            bodyPositions: this.bodyPositions.map(position => position.toJson()),
        };
    }

    static fromData(data: any) {
        log.debug(`parsing data to player:`, data);
        return new Player(
            data.id,
            data.name,
            data.color,
            data.role,
            data.status,
            data.score,
            data.bodyPositions ? data.bodyPositions.map((pos: any) => Position.fromData(pos)) : []);
    }

}
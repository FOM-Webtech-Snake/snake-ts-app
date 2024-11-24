import {PlayerStatusEnum} from "./constants/PlayerStatusEnum";
import {PlayerRoleEnum} from "./constants/PlayerRoleEnum";

export class Player {
    private id: string;
    private name: string;
    private status: PlayerStatusEnum;
    private role: PlayerRoleEnum;
    private score: number;

    // TODO change the default status for a player when lobby is implemented
    constructor(id: string, name: string, role: PlayerRoleEnum, status: PlayerStatusEnum = PlayerStatusEnum.READY, score: number = 0) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.role = role;
        this.score = score;
    }

    getId() {
        return this.id;
    }

    getName(): string {
        return this.name;
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
            status: this.status,
            role: this.role,
            score: this.score,
        };
    }

    static fromData(data: any) {
        return new Player(data.id, data.name, data.role, data.status, data.score);
    }

}
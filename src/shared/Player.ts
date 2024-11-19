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

    setState(status: PlayerStatusEnum): void {
        this.status = status;
    }

    getStatus(): PlayerStatusEnum {
        return this.status;
    }

    getName(): string {
        return this.name;
    }

    getRole(): PlayerRoleEnum {
        return this.role;
    }

    getId() {
        return this.id;
    }

    getScore() {
        return this.score;
    }

    setRole(newRole: PlayerRoleEnum) {
        this.role = newRole;
    }

    toJson() {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            status: this.status,
            role: this.role,
            score: this.score,
        });
    }

    static fromJson(json: string) {
        const data = JSON.parse(json);
        return this.fromData(data);
    }

    static fromData(data: any) {
        return new Player(data.id, data.name, data.role, data.status, data.score);
    }

}
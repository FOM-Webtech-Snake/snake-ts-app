import {PlayerStatusEnum} from "./constants/PlayerStatusEnum";

export class Player {
    private id: string;
    private name: string;
    private status: PlayerStatusEnum;

    // TODO change the default status for a player when lobby is implemented
    constructor(id: string, name: string, status: PlayerStatusEnum = PlayerStatusEnum.READY) {
        this.id = id;
        this.name = name;
        this.status = status;
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

    getId() {
        return this.id;
    }

    toJson() {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            status: this.status,
        });
    }

    static fromJson(json: string) {
        const data = JSON.parse(json);
        return this.fromData(data);
    }

    static fromData(data: any) {
        return new Player(data.id, data.name, data.status);
    }

}
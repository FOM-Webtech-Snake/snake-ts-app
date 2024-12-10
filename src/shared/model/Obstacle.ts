import {Position} from "./Position";
import {ObstacleTypeEnum} from "../constants/ObstacleTypeEnum";

export class Obstacle {

    // config
    protected id: string;
    protected type: ObstacleTypeEnum;
    protected position: Position;

    constructor(id: string, type: ObstacleTypeEnum, position: Position) {
        this.id = id;
        this.type = type;
        this.position = position;
    }

    getId() {
        return this.id;
    }

    getType(): ObstacleTypeEnum {
        return this.type;
    }

    getPosition(): Position {
        return this.position;
    }

    toJson() {
        return {
            id: this.id,
            type: this.type,
            position: this.position.toJson()
        };
    }

    static fromData(data: any): Obstacle {
        return new Obstacle(
            data.id,
            data.type,
            Position.fromData(data.position));
    }
}
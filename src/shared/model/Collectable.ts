import {v4 as uuidV4} from "uuid";
import {ChildCollectableTypeEnum} from "../constants/CollectableTypeEnum";
import {Position} from "./Position";

export class Collectable {

    // config
    protected id: string;
    protected type: ChildCollectableTypeEnum;
    protected position: Position;

    constructor(id: string = null, type: ChildCollectableTypeEnum, position: Position) {
        this.id = id || uuidV4();
        this.type = type;
        this.position = position;
    }

    getId() {
        return this.id;
    }

    getType() {
        return this.type;
    }

    getPosition() {
        return this.position;
    }

    toJson() {
        return {
            id: this.id,
            type: this.type,
            position: this.position.toJson()
        };
    }

    static fromData(data: any): Collectable {
        return new Collectable(
            data.id,
            data.type,
            Position.fromData(data.position));
    }
}
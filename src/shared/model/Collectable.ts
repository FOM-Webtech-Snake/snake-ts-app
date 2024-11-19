import {ChildCollectableTypeEnum} from "../constants/CollectableTypeEnum";
import {Position} from "./Position";

export class Collectable {

    // config
    protected id: string;
    protected type: ChildCollectableTypeEnum;
    protected position: Position;

    constructor(id: string, type: ChildCollectableTypeEnum, position: Position) {
        this.id = id;
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
}
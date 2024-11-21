import {ChildCollectableTypeEnum, ParentCollectableTypeEnum} from "../constants/CollectableTypeEnum";
import {Snake} from "../../client/game/ui/Snake";

export interface ChildCollectable {
    name: string;
    type: ChildCollectableTypeEnum;
    parent: ParentCollectableTypeEnum;
    value: any;
    imageKey: string;
    func: (snake: Snake) => void; // Lambda function
    spawnChance: number;
}

export interface ParentCollectable {
    name: string;
    type: ParentCollectableTypeEnum;
    children: ChildCollectable[];
}
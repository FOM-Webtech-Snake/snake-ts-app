import {ChildCollectableTypeEnum, ParentCollectableTypeEnum} from "../constants/CollectableTypeEnum";
import {PhaserSnake} from "../../client/game/ui/PhaserSnake";

export interface ChildCollectable {
    name: string;
    type: ChildCollectableTypeEnum;
    parent: ParentCollectableTypeEnum;
    value: number;
    imageKey: string;
    func: (snake: PhaserSnake) => void; // Lambda function
    spawnChance: number;
}

export interface ParentCollectable {
    name: string;
    type: ParentCollectableTypeEnum;
    children: ChildCollectable[];
}
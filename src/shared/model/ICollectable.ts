import {ChildCollectableTypeEnum, ParentCollectableTypeEnum} from "../constants/CollectableTypeEnum";
import {Snake} from "../../client/game/ui/Snake";

export interface ChildCollectable {
    name: string;
    type: ChildCollectableTypeEnum;
    parent: ParentCollectableTypeEnum;
    value: any;
    imageKey: string,
    func: (snake: Snake) => void; // Lambda function
}

export interface ParentCollectable {
    name: string;
    type: ParentCollectableTypeEnum;
    children: ChildCollectable[];
}
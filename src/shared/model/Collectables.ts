import {ChildCollectable, ParentCollectable} from "./ICollectable";
import {ChildCollectableTypeEnum, ParentCollectableTypeEnum} from "../constants/CollectableTypeEnum";

export const childCollectables: Record<ChildCollectableTypeEnum, ChildCollectable> = {
    [ChildCollectableTypeEnum.FOOD]: {
        name: "food",
        type: ChildCollectableTypeEnum.FOOD,
        parent: ParentCollectableTypeEnum.FOOD,
        value: 1,
        imageKey: "food_item_apple",
        func: snake => console.log("food")// TODO snake.increase();
    },
    [ChildCollectableTypeEnum.GROWTH]: {
        name: "growth",
        type: ChildCollectableTypeEnum.GROWTH,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_sprout",
        func: snake => console.log("growth")// TODO snake.grow();
    },
    [ChildCollectableTypeEnum.SHRINK]: {
        name: "shrink",
        type: ChildCollectableTypeEnum.SHRINK,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_magnifying_glass",
        func: snake => console.log("shrink")// TODO snake.shrink();
    },
    [ChildCollectableTypeEnum.FAST]: {
        name: "fast",
        type: ChildCollectableTypeEnum.FAST,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_feather",
        func: snake => snake.changeSpeedByFactor(1.2)
    },
    [ChildCollectableTypeEnum.SLOW]: {
        name: "slow",
        type: ChildCollectableTypeEnum.SLOW,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_snail",
        func: snake => snake.changeSpeedByFactor(0.8)
    },
    [ChildCollectableTypeEnum.SPLIT]: {
        name: "split",
        type: ChildCollectableTypeEnum.SPLIT,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_split",
        func: snake => snake.splitInHalf()
    },
    [ChildCollectableTypeEnum.DOUBLE]: {
        name: "double",
        type: ChildCollectableTypeEnum.DOUBLE,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_orange",
        func: snake => console.log("double")// TODO snake.doubleLength();
    },
    [ChildCollectableTypeEnum.REVERSE]: {
        name: "reverse",
        type: ChildCollectableTypeEnum.REVERSE,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_u_turn",
        func: snake => snake.reverseDirection()
    }
};


export const collectables: ParentCollectable[] = [
    {
        name: "food",
        type: ParentCollectableTypeEnum.FOOD,
        children: [
            childCollectables.FOOD
        ]
    },
    {
        name: "powerUp",
        type: ParentCollectableTypeEnum.POWER_UP,
        children: [
            childCollectables.GROWTH,
            childCollectables.SHRINK,
            childCollectables.FAST,
            childCollectables.SLOW,
            childCollectables.SPLIT,
            childCollectables.DOUBLE,
            childCollectables.REVERSE
        ]
    }
];

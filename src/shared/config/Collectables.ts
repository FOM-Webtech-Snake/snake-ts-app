import {ChildCollectable, ParentCollectable} from "../model/ICollectable";
import {ChildCollectableTypeEnum, ParentCollectableTypeEnum} from "../constants/CollectableTypeEnum";

export const childCollectables: Record<ChildCollectableTypeEnum, ChildCollectable> = {
    [ChildCollectableTypeEnum.FOOD]: {
        name: "food",
        type: ChildCollectableTypeEnum.FOOD,
        parent: ParentCollectableTypeEnum.FOOD,
        value: 1,
        imageKey: "food_item_apple",
        func: snake => snake.increase(),
        spawnChance: 50 // 50% chance for FOOD
    },
    [ChildCollectableTypeEnum.GROWTH]: {
        name: "growth",
        type: ChildCollectableTypeEnum.GROWTH,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_sprout",
        func: snake => snake.changeScaleBy(+0.025),
        spawnChance: 10
    },
    [ChildCollectableTypeEnum.SHRINK]: {
        name: "shrink",
        type: ChildCollectableTypeEnum.SHRINK,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_magnifying_glass",
        func: snake => snake.changeScaleBy(-0.025),
        spawnChance: 10
    },
    [ChildCollectableTypeEnum.FAST]: {
        name: "fast",
        type: ChildCollectableTypeEnum.FAST,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_feather",
        func: snake => snake.changeSpeedBy(+15),
        spawnChance: 10
    },
    [ChildCollectableTypeEnum.SLOW]: {
        name: "slow",
        type: ChildCollectableTypeEnum.SLOW,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_snail",
        func: snake => snake.changeSpeedBy(-15),
        spawnChance: 10
    },
    [ChildCollectableTypeEnum.SPLIT]: {
        name: "split",
        type: ChildCollectableTypeEnum.SPLIT,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_split",
        func: snake => snake.splitInHalf(),
        spawnChance: 5
    },
    [ChildCollectableTypeEnum.DOUBLE]: {
        name: "double",
        type: ChildCollectableTypeEnum.DOUBLE,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_orange",
        func: snake => snake.doubleLength(),
        spawnChance: 3
    },
    [ChildCollectableTypeEnum.REVERSE]: {
        name: "reverse",
        type: ChildCollectableTypeEnum.REVERSE,
        parent: ParentCollectableTypeEnum.POWER_UP,
        value: 1,
        imageKey: "power_up_u_turn",
        func: snake => snake.reverseDirection(),
        spawnChance: 2
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

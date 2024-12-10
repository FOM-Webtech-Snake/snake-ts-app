import {ObstacleTypeEnum} from "../constants/ObstacleTypeEnum";
import {IObstacle} from "../model/IObstacles";

export const obstacles: Record<ObstacleTypeEnum, IObstacle> = {
    [ObstacleTypeEnum.GRAVESTONE]: {
        name: "gravestone",
        type: ObstacleTypeEnum.GRAVESTONE,
        imageKey: "gravestone",
    },
};

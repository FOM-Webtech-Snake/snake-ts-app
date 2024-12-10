import {ObstacleTypeEnum} from "../constants/ObstacleTypeEnum";

export interface IObstacle {
    name: string;
    type: ObstacleTypeEnum;
    imageKey: string;
}
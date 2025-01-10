import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {Position} from "../../../shared/model/Position";
import {Size} from "../../../shared/model/Size";

export class DirectionUtil {
    static getDirectionVector(direction: DirectionEnum): Phaser.Math.Vector2 {
        switch (direction) {
            case DirectionEnum.UP:
                return new Phaser.Math.Vector2(0, -1);
            case DirectionEnum.DOWN:
                return new Phaser.Math.Vector2(0, 1);
            case DirectionEnum.LEFT:
                return new Phaser.Math.Vector2(-1, 0);
            case DirectionEnum.RIGHT:
                return new Phaser.Math.Vector2(1, 0);
            default:
                throw new Error("Invalid direction");
        }
    }

    static getRotationAngle(direction: DirectionEnum): number {
        switch (direction) {
            case DirectionEnum.UP:
                return 0;
            case DirectionEnum.DOWN:
                return Math.PI;
            case DirectionEnum.LEFT:
                return -Math.PI / 2;
            case DirectionEnum.RIGHT:
                return Math.PI / 2;
            default:
                throw new Error("Invalid direction");
        }
    }

    static getOppositeDirection(direction: DirectionEnum): DirectionEnum {
        switch (direction) {
            case DirectionEnum.UP:
                return DirectionEnum.DOWN;
            case DirectionEnum.DOWN:
                return DirectionEnum.UP;
            case DirectionEnum.LEFT:
                return DirectionEnum.RIGHT;
            case DirectionEnum.RIGHT:
                return DirectionEnum.LEFT;
            default:
                throw new Error("Invalid direction");
        }
    }

    static getSafeDirection(position: Position, size: Size) : DirectionEnum {
        const width = size.getWidth();
        const height = size.getHeight();
        let spawnDirection: DirectionEnum;

        // Finde the closest wall
        const distanceToLeft = position.getX();
        const distanceToRight = width - position.getX();
        const distanceToTop = position.getY();
        const distanceToBottom = height - position.getY();

        const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);

        // Set the direction away from the nearest wall
        if (minDistance === distanceToLeft) {
            spawnDirection = DirectionEnum.RIGHT;
        } else if (minDistance === distanceToRight) {
            spawnDirection = DirectionEnum.LEFT;
        } else if (minDistance === distanceToTop) {
            spawnDirection = DirectionEnum.DOWN;
        } else {
            spawnDirection = DirectionEnum.UP;
        }

        return spawnDirection;
    }
}
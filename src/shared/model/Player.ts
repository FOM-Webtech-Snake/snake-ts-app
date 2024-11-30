import {PlayerStatusEnum} from "../constants/PlayerStatusEnum";
import {PlayerRoleEnum} from "../constants/PlayerRoleEnum";
import {getLogger} from "../config/LogConfig";
import {Position} from "./Position";
import {DirectionEnum} from "../constants/DirectionEnum";
import {SNAKE_STARTING_SCALE, SNAKE_STARTING_SPEED} from "./GameSessionConfig";

const log = getLogger("shared.Player");

export const DEFAULT_SNAKE_DIRECTION: DirectionEnum = DirectionEnum.RIGHT;

export class Player {
    private id: string;
    private name: string;
    private color: string;
    private status: PlayerStatusEnum;
    private role: PlayerRoleEnum;
    private score: number;
    private speed: number;
    private scale: number;
    private direction: DirectionEnum;
    private bodyPositions: Position[];

    constructor(id: string,
                name: string,
                color: string,
                role: PlayerRoleEnum,
                status: PlayerStatusEnum = PlayerStatusEnum.READY,
                score: number = 0,
                speed: number = SNAKE_STARTING_SPEED.default,
                scale: number = SNAKE_STARTING_SCALE.default,
                direction: DirectionEnum = DEFAULT_SNAKE_DIRECTION,
                bodyPositions: Position[] = []) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.status = status;
        this.role = role;
        this.score = score;
        this.speed = speed;
        this.scale = scale;
        this.direction = direction;
        this.bodyPositions = bodyPositions;
    }

    getId() {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getSpeed(): number {
        return this.speed;
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    setScale(scale: number) {
        this.scale = scale;
    }

    getScale(): number {
        return this.scale;
    }

    getDirection(): DirectionEnum {
        return this.direction;
    }

    setDirection(direction: DirectionEnum) {
        this.direction = direction;
    }

    getColor(): string {
        return this.color;
    }

    getBodyPositions(): Position[] {
        return this.bodyPositions;
    }

    setBodyPositions(bodyPositions: Position[]) {
        this.bodyPositions = bodyPositions;
    }

    setName(name: string): void {
        this.name = name;
    }

    getStatus(): PlayerStatusEnum {
        return this.status;
    }

    setStatus(status: PlayerStatusEnum): void {
        this.status = status;
    }

    getRole(): PlayerRoleEnum {
        return this.role;
    }

    setRole(newRole: PlayerRoleEnum) {
        this.role = newRole;
    }

    getScore() {
        return this.score;
    }

    addScore(value: number): number {
        this.score += value;
        return this.score;
    }

    toJson() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            role: this.role,
            status: this.status,
            score: this.score,
            speed: this.speed,
            scale: this.scale,
            direction: this.direction,
            bodyPositions: this.bodyPositions.map(position => position.toJson()),
        };
    }

    updateFromSnakeData(data: any) {
        const bodyPositions: Position[] = [];
        data.body.forEach((pos: any) => {
            bodyPositions.push(Position.fromData(pos));
        })
        log.trace("updated bodyPositions", bodyPositions);
        this.setBodyPositions(bodyPositions);
        this.setDirection(data.direction);
        this.setSpeed(data.speed);
        this.setScale(data.scale);

        log.trace(`Player ${this.id} updated with ${data}`);
    }

    static fromData(data: any) {
        log.debug(`parsing data to player:`, data);
        return new Player(
            data.id,
            data.name,
            data.color,
            data.role,
            data.status,
            data.score,
            data.speed,
            data.scale,
            data.direction,
            data.bodyPositions ? data.bodyPositions.map((pos: any) => Position.fromData(pos)) : []);
    }

}
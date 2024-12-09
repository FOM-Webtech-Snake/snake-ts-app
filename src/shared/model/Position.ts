import {DirectionEnum} from "../constants/DirectionEnum";

export class Position {
    private x: number;
    private y: number;
    private locked: boolean;
    private rotation: number;

    constructor(x: number, y: number, locked: boolean = false, rotation: number = 0) {
        this.x = x;
        this.y = y;
        this.locked = locked;
        this.rotation = rotation;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    getLocked(): boolean {
        return this.locked;
    }

    getRotation(): number {
        return this.rotation;
    }

    setX(x: number) {
        this.x = x;
    }

    setY(y: number) {
        this.y = y;
    }

    setLocked(locked: boolean) {
        this.locked = locked;
    }

    updatePos(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toJson() {
        return {
            x: this.x,
            y: this.y,
            locked: this.locked,
            rotation: this.rotation,
        };
    }

    static fromData(data: any) {
        return new Position(data.x, data.y, data.locked, data.rotation);
    }
}
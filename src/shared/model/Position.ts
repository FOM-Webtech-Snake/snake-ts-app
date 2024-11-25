export class Position {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    setX(x: number) {
        this.x = x;
    }

    setY(y: number) {
        this.y = y;
    }

    updatePos(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toJson() {
        return {
            x: this.x,
            y: this.y,
        };
    }

    static fromData(data: any) {
        return new Position(data.x, data.y);
    }

    encode(): string {
        return `${this.getX()},${this.getY()}`;
    }

}
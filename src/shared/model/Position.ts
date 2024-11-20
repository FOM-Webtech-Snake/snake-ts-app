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

    static fromJson(json: string) {
        return this.fromData(JSON.parse(json));
    }

    static fromData(data: any) {
        return new Position(data.x, data.y);
    }

    toString(): string {
        return `Position(x: ${this.x}, y: ${this.y})`;
    }

}
import {PhaserSnake} from "./PhaserSnake";

export class SpatialGrid {
    private grid: Map<string, PhaserSnake[]> = new Map();
    private cellSize: number;

    constructor(cellSize: number) {
        this.cellSize = cellSize;
    }

    private getCellKey(x: number, y: number): string {
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        return `${gridX}:${gridY}`;
    }

    public addSnake(snake: PhaserSnake): void {
        const head = snake.getHead();
        const cellKey = this.getCellKey(head.x, head.y);
        if (!this.grid.has(cellKey)) {
            this.grid.set(cellKey, []);
        }
        this.grid.get(cellKey).push(snake);
    }

    public getPotentialColliders(snake: PhaserSnake): PhaserSnake[] {
        const head = snake.getHead();
        const cellKey = this.getCellKey(head.x, head.y);
        return this.grid.get(cellKey) || [];
    }

    public clear(): void {
        this.grid.clear();
    }
}

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
        for (const bodyPart of snake.getBody()) {
            const cellKey = this.getCellKey(bodyPart.x, bodyPart.y);
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, []);
            }
            this.grid.get(cellKey).push(snake);
        }
    }

    public getPotentialColliders(snake: PhaserSnake): PhaserSnake[] {
        const head = snake.getHead();
        const baseCell = this.getCellKey(head.x, head.y);
        const [baseX, baseY] = baseCell.split(':').map(Number);

        const potentialColliders: PhaserSnake[] = [];

        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            for (let offsetY = -1; offsetY <= 1; offsetY++) {
                const neighborKey = `${baseX + offsetX}:${baseY + offsetY}`;
                if (this.grid.has(neighborKey)) {
                    potentialColliders.push(...this.grid.get(neighborKey));
                }
            }
        }

        return potentialColliders;
    }

    public clear(): void {
        this.grid.clear();
    }
}

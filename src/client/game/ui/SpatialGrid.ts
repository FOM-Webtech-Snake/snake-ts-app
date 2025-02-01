import {PhaserSnake} from "./PhaserSnake";
import {PhaserCollectable} from "./PhaserCollectable";

export class SpatialGrid {
    private cells: Map<string, (PhaserSnake | PhaserCollectable)[]> = new Map();
    private cellSize: number;

    constructor(cellSize: number) {
        this.cellSize = cellSize;
    }

    private getCellKey(x: number, y: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX}:${cellY}`;
    }

    private getOverlappingCells(x: number, y: number, width: number, height: number): string[] {
        const overlappingCells: string[] = [];

        // calculate the min and max cells
        const minCellX = Math.floor((x - width / 2) / this.cellSize);
        const maxCellX = Math.floor((x + width / 2) / this.cellSize);
        const minCellY = Math.floor((y - height / 2) / this.cellSize);
        const maxCellY = Math.floor((y + height / 2) / this.cellSize);

        // iterate over all overlapping cells
        for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
            for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
                overlappingCells.push(`${cellX},${cellY}`);
            }
        }

        return overlappingCells;
    }

    public addGameObject(gameObject: PhaserSnake | PhaserCollectable): void {
        const body = gameObject instanceof PhaserSnake ? gameObject.getBody() : [gameObject.getBody()];

        for (const part of body) {
            const width = part.displayWidth;
            const height = part.displayHeight;
            const overlappingCellKeys = this.getOverlappingCells(part.x, part.y, width, height);

            for (const cellKey of overlappingCellKeys) {
                if (!this.cells.has(cellKey)) {
                    this.cells.set(cellKey, []);
                }
                this.cells.get(cellKey).push(gameObject);
            }
        }
    }

    public getPotentialColliders(x: number, y: number, width: number, height: number): Set<PhaserSnake | PhaserCollectable> {
        const overlappingCellKeys = this.getOverlappingCells(x, y, width, height);
        const potentialCollidersSet = new Set<PhaserSnake | PhaserCollectable>();

        for (const cellKey of overlappingCellKeys) {
            const cellObjects: (PhaserSnake | PhaserCollectable)[] = this.cells.get(cellKey);
            if (cellObjects) {
                cellObjects.forEach(obj => potentialCollidersSet.add(obj));
            }
        }

        return potentialCollidersSet;
    }

    public clear(): void {
        this.cells.clear();
    }
}

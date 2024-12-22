import {SpatialGrid} from "../../../../src/client/game/ui/SpatialGrid";
import {PhaserSnake} from "../../../../src/client/game/ui/PhaserSnake";

describe("SpatialGrid", () => {
    let spatialGrid: SpatialGrid;
    const mockCellSize = 50;

    beforeEach(() => {
        spatialGrid = new SpatialGrid(mockCellSize);
    });

    function createMockSnake(bodyParts: { x: number; y: number }[]): PhaserSnake {
        const mockSnake = {
            getBody: jest.fn(() => bodyParts),
            getHead: jest.fn(() => bodyParts[0]),
        } as unknown as PhaserSnake;

        return mockSnake;
    }

    test("should correctly add a snake to the grid", () => {
        const snake = createMockSnake([
            {x: 10, y: 20},
            {x: 20, y: 20},
        ]);

        spatialGrid.addSnake(snake);

        expect(spatialGrid["grid"].size).toBe(1);
        const cellKey = spatialGrid["getCellKey"](10, 20);
        expect(spatialGrid["grid"].get(cellKey)).toContain(snake);
    });

    test("should retrieve potential colliders correctly", () => {
        const snake1 = createMockSnake([
            {x: 10, y: 10},
        ]);
        const snake2 = createMockSnake([
            {x: 60, y: 60},
        ]);
        const snake3 = createMockSnake([
            {x: 110, y: 110},
        ]);

        spatialGrid.addSnake(snake1);
        spatialGrid.addSnake(snake2);
        spatialGrid.addSnake(snake3);

        const potentialColliders = spatialGrid.getPotentialColliders(snake1);
        expect(potentialColliders).toContain(snake1);
        expect(potentialColliders).not.toContain(snake3);
    });

    test("should clear all data from the grid", () => {
        const snake = createMockSnake([
            {x: 10, y: 20},
        ]);

        spatialGrid.addSnake(snake);
        spatialGrid.clear();

        expect(spatialGrid["grid"].size).toBe(0);
    });
});

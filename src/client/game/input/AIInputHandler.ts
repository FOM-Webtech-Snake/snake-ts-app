import EasyStar from "easystarjs";
import {InputHandler} from "./InputHandler";
import {GameScene} from "../scenes/GameScene";
import {DirectionEnum} from "../../../shared/constants/DirectionEnum";
import {InputTypeEnum} from "../../../shared/constants/InputTypeEnum";
import {Position} from "../../../shared/model/Position";
import {getLogger} from "../../../shared/config/LogConfig";
import {CollectableManager} from "../ui/manager/CollectableManager";

const log = getLogger("client.game.input.AIInputHandler");

export class AIInputHandler extends InputHandler {
    private easystar: EasyStar.js;
    private grid: number[][];
    private lastUpdateTime: number = 0;
    private directionCooldown: number = 200;
    private collectableManager: CollectableManager;

    constructor(scene: GameScene, collectableManager: CollectableManager, active: boolean = false) {
        super(scene, InputTypeEnum.AI, active);

        this.collectableManager = collectableManager;

        // init easy* (a* algo)
        this.easystar = new EasyStar.js();
        this.easystar.setAcceptableTiles([0]); // 0 indicates empty space
    }

    async handleInput(): Promise<void> {
        if (!this.isAssigned() || !this.snake || !this.snake.getHeadPosition()) {
            log.debug("Input handler AutopilotInputHandler is not assigned");
            return;
        }

        const currentTime = this.scene.sys.game.getTime();

        // Avoid recalculating too frequently
        if (currentTime - this.lastUpdateTime < this.directionCooldown) {
            return;
        }

        // Update the grid with snake's body and obstacles
        this.updateGrid();
        const snakeHead = this.snake.getHeadPosition();

        const collectablePositions = this.collectableManager.getPositionsFromAllCollectables();
        if (!collectablePositions || collectablePositions.length === 0) {
            log.debug("No collectables available.");
            return;
        }

        const nearestCollectable = await this.findNearestCollectableAsync(snakeHead, collectablePositions);
        if (!nearestCollectable) {
            log.debug("No reachable collectables.");
            return;
        }

        // Convert positions to grid indices
        const startX = this.toGridIndex(snakeHead.getX());
        const startY = this.toGridIndex(snakeHead.getY());
        const endX = this.toGridIndex(nearestCollectable.getX());
        const endY = this.toGridIndex(nearestCollectable.getY());

        if (this.isWithinBounds(startX, startY) && this.isWithinBounds(endX, endY)) {
            this.easystar.findPath(startX, startY, endX, endY, (path) => {
                if (path && path.length > 1) {
                    // Determine the next step
                    const nextStep = path[1]; // First step is the current position

                    // Calculate direction based on next step
                    const newDirection = this.getDirectionFromNextStep(snakeHead, nextStep);
                    log.trace("newDirection", newDirection);


                    // Update snake's direction
                    if (this.isValidDirection(newDirection)) {
                        this.snake.setDirection(newDirection);
                        this.lastUpdateTime = currentTime;
                    }
                }
            });

            this.easystar.calculate();
        } else {
            log.warn("Start or end point is out of bounds.");
        }
    }

    private createGrid(): number[][] {
        const cellSize = this.snake.getHead().displayWidth; // Use snake's size for cell size
        const width = Math.floor(this.scene.physics.world.bounds.width / cellSize);
        const height = Math.floor(this.scene.physics.world.bounds.height / cellSize);

        return Array.from({length: height}, () => Array(width).fill(0)); // Initialize all cells to 0
    }

    private updateGrid(): void {
        this.grid = this.createGrid(); // Reset grid

        // Mark the snake's body as obstacles
        const snakeBody = this.snake.getBodyPositions();
        for (const segment of snakeBody) {
            const gridX = this.toGridIndex(segment.getX());
            const gridY = this.toGridIndex(segment.getY());

            if (this.isWithinBounds(gridX, gridY)) {
                this.grid[gridY][gridX] = 1; // 1 indicates an obstacle
            }
        }

        this.easystar.setGrid(this.grid); // Update EasyStar's grid
    }

    private async findNearestCollectableAsync(snakeHead: Position, collectables: Position[]): Promise<Position | null> {
        let shortestPathLength: number | null = null;
        let nearestCollectable: Position | null = null;

        const startX = this.toGridIndex(snakeHead.getX());
        const startY = this.toGridIndex(snakeHead.getY());

        if (!this.isWithinBounds(startX, startY)) {
            return; // snake not inside the gameScene ... should never happen
        }

        for (const collectable of collectables) {
            const endX = this.toGridIndex(collectable.getX());
            const endY = this.toGridIndex(collectable.getY());

            if (this.isWithinBounds(endX, endY)) {
                const path = await this.findPathAsync(startX, startY, endX, endY);
                if (path) {
                    if (shortestPathLength === null || path.length < shortestPathLength) {
                        shortestPathLength = path.length;
                        nearestCollectable = collectable;
                    }

                }

            }
        }

        return nearestCollectable;
    }

    private findPathAsync(startX: number, startY: number, endX: number, endY: number): Promise<any> {
        return new Promise((resolve) => {
            this.easystar.findPath(startX, startY, endX, endY, resolve);
            this.easystar.calculate();
        });
    }

    private getDirectionFromNextStep(snakeHead: Position, nextStep: { x: number; y: number }): DirectionEnum {
        const headGridX = this.toGridIndex(snakeHead.getX());
        const headGridY = this.toGridIndex(snakeHead.getY());

        // Calculate relative movement on the grid
        const stepDeltaX = nextStep.x - headGridX;
        const stepDeltaY = nextStep.y - headGridY;

        log.trace("Head Grid:", headGridX, headGridY, "Next Step Grid:", nextStep.x, nextStep.y);
        log.trace("StepDeltaX:", stepDeltaX, "StepDeltaY:", stepDeltaY, "Current Direction:", this.snake.getDirection());

        // Determine direction based on the next grid position
        if (stepDeltaX > 0) return DirectionEnum.RIGHT; // Moving to the right
        if (stepDeltaX < 0) return DirectionEnum.LEFT;  // Moving to the left
        if (stepDeltaY > 0) return DirectionEnum.DOWN;  // Moving downward
        if (stepDeltaY < 0) return DirectionEnum.UP;    // Moving upward

        // Default to the current direction if no valid movement is detected
        return this.snake.getDirection();
    }

    private isValidDirection(newDirection: DirectionEnum): boolean {
        const currentDirection = this.snake.getDirection();

        // Prevent reversing direction
        return !(
            (newDirection === DirectionEnum.UP && currentDirection === DirectionEnum.DOWN) ||
            (newDirection === DirectionEnum.DOWN && currentDirection === DirectionEnum.UP) ||
            (newDirection === DirectionEnum.LEFT && currentDirection === DirectionEnum.RIGHT) ||
            (newDirection === DirectionEnum.RIGHT && currentDirection === DirectionEnum.LEFT)
        );
    }

    private isWithinBounds(x: number, y: number): boolean {
        return y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[0].length;
    }

    private toGridIndex(position: number): number {
        const cellSize = this.snake.getHead().displayWidth;
        return Math.floor(position / cellSize);
    }
}

export class ArrowManager {
    private static instance: ArrowManager;
    private arrowPositions: Phaser.Math.Vector2[];

    private constructor() {
        this.arrowPositions = [];
    }

    static getInstance(): ArrowManager {
        if (!ArrowManager.instance) {
            ArrowManager.instance = new ArrowManager();
        }
        return ArrowManager.instance;
    }

    reset(): void {
        this.arrowPositions = [];
    }

    isOverlapping(newPosition: Phaser.Math.Vector2, threshold: number = 30): boolean {
        for (const position of this.arrowPositions) {
            if (Phaser.Math.Distance.Between(position.x, position.y, newPosition.x, newPosition.y) < threshold) {
                return true;
            }
        }
        return false;
    }

    addArrowPosition(position: Phaser.Math.Vector2): void {
        this.arrowPositions.push(position);
    }
}

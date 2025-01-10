import {Position} from "../../shared/model/Position";
import {GameSessionConfig} from "../../shared/model/GameSessionConfig";
import {GameSession} from "../../shared/model/GameSession";
import {BORDER_WIDTH} from "../../shared/constants/BorderWidth";

const MIN_DISTANCE: number = 25;

export class PositionUtil {
    static randomUniquePosition(session: GameSession): Position {
        const config = session.getConfig();
        const usedPositions = new Set<Position>();

        // Collect all used positions (by players and collectables)
        Object.values(session.getPlayers()).forEach(player => {
            player.getBodyPositions().forEach(pos => {
                usedPositions.add(pos);
            });
        });

        // add used collectable positions
        Object.values(session.getCollectables()).forEach(collectable => {
            const pos = collectable.getPosition();
            usedPositions.add(pos);
        });

        // add used obstacle positions
        Object.values(session.getObstacles()).forEach(obstacle => {
            const pos = obstacle.getPosition();
            usedPositions.add(pos);
        });

        // Generate random positions until we find one that is not used
        let newPosition: Position;
        let isValidPosition: boolean;
        do {
            newPosition = this.randomPosition(config);
            // check uniqueness and minimum distance
            isValidPosition = !usedPositions.has(newPosition) &&
                Array.from(usedPositions).every(pos => {
                    return this.calculateDistance(pos, newPosition) >= MIN_DISTANCE;
                });
        } while (!isValidPosition);

        return newPosition;
    }

    static randomPosition(config: GameSessionConfig): Position {
        const width = config.getSize().getWidth();
        const height = config.getSize().getHeight();

        // exclude positions on border
        const buffer = 10;
        const innerWidth = width - (BORDER_WIDTH * 2)  - (buffer * 2);
        const innerHeight = height - (BORDER_WIDTH * 2)  - (buffer * 2);

        return new Position(
            Math.floor(Math.random() * innerWidth) + BORDER_WIDTH + buffer,
            Math.floor(Math.random() * innerHeight) + BORDER_WIDTH + buffer
        );
    }

    static calculateDistance(pos1: Position, pos2: Position): number {
        const dx = pos1.getX() - pos2.getX();
        const dy = pos1.getY() - pos2.getY();
        return Math.sqrt(dx * dx + dy * dy); // euclidean distance
    }
}
import {Position} from "../../shared/model/Position";
import {GameSessionConfig} from "../../shared/GameSessionConfig";

export class PositionUtil {
    static randomPosition(config: GameSessionConfig): Position {
        return new Position(
            Math.floor(Math.random() * (config.getSize().height)),
            Math.floor(Math.random() * (config.getSize().width)));
    }
}
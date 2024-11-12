import express, {Request, Response} from "express";
import {GameSession} from "../../shared/GameSession";

const router = express.Router();

router.get("/available-games", (request: Request, response: Response) => {
    const availableGames = [
        {id: 1, name: "session 1"},
        {id: 2, name: "session 2"},
    ];
    response.json(availableGames);
});

router.post("/create", (request: Request, response: Response) => {
    const {id, name} = request.body;
    const newGame = new GameSession(id, name);
    response.status(201).json(newGame);
});

export default router;
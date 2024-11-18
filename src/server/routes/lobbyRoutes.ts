import express, {Request, Response} from "express";
import {sessionManager} from "../SessionManager";

const router = express.Router();

router.get("/available-games", (request: Request, response: Response) => {
    const availableGames = sessionManager.getAvailableGames();
    response.json(availableGames);
});

router.post("/create", (request: Request, response: Response) => {
    const {playerId} = request.body;

    // Create and store the game session
    const newGame = sessionManager.createSession(playerId);
    console.log(`created new game session: ${newGame.getId()} - ${newGame.getCreatorId()}`);

    response.status(201).json(newGame);
});

router.post("/join", (request: Request, response: Response) => {
    const {sessionId, playerId} = request.body;

    try {
        const session = sessionManager.joinSession(sessionId, playerId);
        console.log(`player ${playerId} joined game session: ${sessionId}`);

        response.status(200).json(session);
    } catch (error) {
        response.status(404).json({ error: "Session not found" });
    }
});

export default router;

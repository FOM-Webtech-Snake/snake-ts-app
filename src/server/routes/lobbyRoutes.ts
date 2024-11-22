import express, {Request, Response} from "express";
import {sessionManager} from "../SessionManager";

const router = express.Router();

router.get("/available-games", (request: Request, response: Response) => {
    const availableGames = sessionManager.getAvailableGames();
    response.json(availableGames);
});

export default router;

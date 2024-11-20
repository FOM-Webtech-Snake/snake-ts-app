import express, {Request, Response} from "express";
import {sessionManager} from "../SessionManager";
import {DEFAULT_GAME_SESSION_CONFIG} from "../../shared/GameSessionConfig";
import {Player} from "../../shared/Player";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";

const router = express.Router();

router.get("/available-games", (request: Request, response: Response) => {
    const availableGames = sessionManager.getAvailableGames();
    response.json(availableGames);
});

// router.post("/create", (request: Request, response: Response) => {
//     const {playerId, playerName} = request.body;
//
//     // Create and store the game session
//     const newPlayer = new Player(playerId, playerName, PlayerRoleEnum.HOST);
//     const newGame = sessionManager.createSession(newPlayer, DEFAULT_GAME_SESSION_CONFIG);
//     console.log(`created new game session: ${newGame.getId()} - ${newGame.getOwnerId()}`);
//
//     response.status(201).json(newGame);
// });
//
// router.post("/join", (request: Request, response: Response) => {
//     const {sessionId, playerId, playerName} = request.body;
//
//     try {
//         const newPlayer = new Player(playerId, playerName, PlayerRoleEnum.GUEST);
//         const session = sessionManager.joinSession(sessionId, newPlayer);
//         console.log(`player ${playerId} joined game session: ${sessionId}`);
//
//         response.status(200).json(session);
//     } catch (error) {
//         response.status(404).json({ error: "Session not found" });
//     }
// });

export default router;

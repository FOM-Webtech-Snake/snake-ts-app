import express, {Request, Response} from "express";

const router = express.Router();

router.get("/", (request: Request, response: Response) => {
    const config = {maxPlayers: 4, mapSize: {height: 600, width: 800}};
    response.json(config);
});

export default router;
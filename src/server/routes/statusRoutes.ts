import express, {Request, Response} from "express";

const router = express.Router();

router.get("/", (request: Request, response: Response) => {
    response.json({message: "Server is up and running!"});
});

export default router;
import express, {Application, Request, Response} from "express";

const app: Application = express();

app.use(express.static("dist")); // middleware to serve static files (like phaser client)
app.get("/api/status", (req: Request, res: Response) => {
    res.json({message: "Server is up and running!"});
});

export default app;
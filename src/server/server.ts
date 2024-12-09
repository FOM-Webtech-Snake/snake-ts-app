import express, {Application} from "express";
import * as path from "node:path";

const app: Application = express();
app.use(express.static(path.join(__dirname, "../../dist/client"))); // middleware to serve static files (like phaser client)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../dist/client/index.html"));
})

export default app;
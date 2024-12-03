import express, {Application} from "express";
import bodyParser from 'body-parser';

const app: Application = express();
app.use(express.static("dist")); // middleware to serve static files (like phaser client)
app.use(bodyParser.json());

export default app;
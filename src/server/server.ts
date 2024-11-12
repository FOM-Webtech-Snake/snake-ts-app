import express, {Application, Request, Response} from "express";
import bodyParser from 'body-parser';

// Import routes
import lobbyRoutes from './routes/lobbyRoutes.js';
import configRoutes from './routes/configRoutes.js';
import statusRoutes from './routes/statusRoutes.js';


const app: Application = express();
app.use(express.static("dist")); // middleware to serve static files (like phaser client)

app.use(bodyParser.json());
app.use('/api/lobby', lobbyRoutes);
app.use('/api/config', configRoutes);
app.use('/api/status', statusRoutes);

export default app;
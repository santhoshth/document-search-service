// app.ts
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import routes from './routes';
import { handleShutdown } from './utils';

const PORT = process.env.SERVICE_PORT || 3000;
const app = express();

// Logger configuration
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: { colorize: true },
    },
});

// Middleware setup
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cors());

// Initialize Elasticsearch client
export const elasticClient = new Client({
    cloud: {
        id: process.env.ELASTIC_CLOUD_ID || '',
    },
    auth: {
        apiKey: process.env.ELASTIC_API_KEY || '',
    },
});

// Register routes
app.use(routes);

// Start the server
const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => handleShutdown(server, logger, 'SIGINT'));
process.on('SIGTERM', () => handleShutdown(server, logger, 'SIGTERM'));

export default app;

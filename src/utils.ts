import { Server } from 'http';
import pino from 'pino';
import { elasticClient } from './app';

export const handleShutdown = (server: Server, logger: pino.Logger, signal: string) => {
    logger.info(`Received ${signal}. Shutting down...`);

    server.close(async () => {
        logger.info('HTTP server closed.');
        await elasticClient.close();
        process.exit(0);
    });

    setTimeout(() => {
        logger.error('Forcing shutdown due to timeout.');
        process.exit(1);
    }, 10000);
};

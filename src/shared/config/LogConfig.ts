import pino, {Logger} from 'pino';

// Create a pino logger instance with a default configuration
const loggerInstances: Map<string, Logger> = new Map();

export function getLogger(name: string): Logger {
    if (!loggerInstances.has(name)) {
        const logger = pino({
            name, // Attach the logger name
            level: resolveLogLevel(name), // Dynamically resolve the log level based on the name
            transport: {target: 'pino-pretty'}
        });
        loggerInstances.set(name, logger);
    }
    return loggerInstances.get(name)!;
}

function resolveLogLevel(name: string): string {
    // Define log level based on the name
    if (/server.+/.test(name)) {
        return 'info';
    } else if (/client.+/.test(name)) {
        return 'info';
    } else if (/shared.+/.test(name)) {
        return 'info';
    }
    // Default log level
    return 'debug';
}

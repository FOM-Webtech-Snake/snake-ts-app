import {LogLevel} from "typescript-logging";
import {Log4TSProvider, Logger} from "typescript-logging-log4ts-style";

const provider = Log4TSProvider.createProvider("Log4TSProvider", {
    /* Specify the various group expressions to match against */
    groups: [{
        expression: new RegExp("server.+"),
        level: LogLevel.Debug,
    }, {
        expression: new RegExp("client.+"),
        level: LogLevel.Debug,
    }, {
        expression: new RegExp("shared.+"),
        level: LogLevel.Debug,
    }],
});

export function getLogger(name: string): Logger {
    return provider.getLogger(name);
}
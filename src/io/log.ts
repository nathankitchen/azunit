import * as Globalization from "../i18n/locales";
import { MessageType } from "../i18n/messages";

export interface IAzuLog {
    write(message: Globalization.IAzuCultureMessage): void;
    error(err: Error): void;
}

export class ConsoleLog {
    constructor(locale: Globalization.IAzuLocale) {
        this._locale = locale;
    }

    private _locale: Globalization.IAzuLocale;

    write(message: Globalization.IAzuCultureMessage) {
        
        let iconFormatter = (i: string, t: MessageType) => {
            if (t == MessageType.Success) {
                return "\x1b[32m" + i + "\x1b[0m";
            }
            else if (t == MessageType.Failure) {
                return "\x1b[31m" + i + "\x1b[0m";
            }
            else if (t == MessageType.Heading) {
                return "\x1b[34m" + i + "\x1b[0m";
            }
            return i;
        };

        // Tokens print out a bit brighter.
        let tokenFormatter = (t: string) => {
            return "\x1b[1m" + t + "\x1b[0m";
        };

        // Errors need to print out red.
        if (message.type == MessageType.Error) {
            console.log("\x1b[31m" + message.toString(this._locale, iconFormatter, tokenFormatter) + "\x1b[0m");
        }
        else if (message.type == MessageType.Title) {
            console.log("\x1b[37m\x1b[4m\x1b[1m" + message.toString(this._locale, iconFormatter, tokenFormatter) + "\x1b[0m");
        }
        else if (message.type == MessageType.Heading) {
            console.log("\x1b[34m" + message.toString(this._locale, iconFormatter, tokenFormatter) + "\x1b[0m");
        }
        else {
            console.log(message.toString(this._locale, iconFormatter, tokenFormatter));
        }
    }

    error(err: Error) {
        let message = Globalization.Resources.fatalError(err);
        console.log(message.toString(this._locale, ));
    }
}

export class MemoryLog {

    constructor() {
        this._log = Array<Globalization.IAzuCultureMessage>();
    }

    private _log: Array<Globalization.IAzuCultureMessage>;

    public write(message: Globalization.IAzuCultureMessage) {
        this._log.push(message);
    }

    public error(err: Error) {
        this._log.push(Globalization.Resources.fatalError(err));
    }

    public to() {

    }
}
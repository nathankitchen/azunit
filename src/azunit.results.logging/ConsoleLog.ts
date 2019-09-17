import * as Globalization from "../azunit.globalization";
import { BaseLog } from "./BaseLog";
import { ConsoleLogFunc } from "./ConsoleLogFunc";
import { MessageType, IAzuCultureMessage, Resources, AssertionMessage } from "../azunit.globalization.messages";
import * as Results from "../azunit.results";

export class ConsoleLog extends BaseLog {

    constructor(locale: Globalization.IAzuLocale, log: ConsoleLogFunc) {
        super(locale);
        this._log = log;
    }

    private _log: ConsoleLogFunc;

    write(message: IAzuCultureMessage) {
        
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
        let tokenFormatter = (t: string, tokenStart?: string, tokenEnd?: string) => {
            let start = (tokenStart) ? tokenStart : "";
            let end = (tokenEnd) ? tokenEnd : "";
            return start + "\x1b[1m" + t + "\x1b[0m" + end;
        };

        // Errors need to print out red.
        if (message.type == MessageType.Error) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize());
            this._log("\x1b[31m" + text + "\x1b[0m");
        }
        else if (message.type == MessageType.Title) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize());
            this._log("\x1b[37m\x1b[4m\x1b[1m" + text + "\x1b[0m");
        }
        else if (message.type == MessageType.Heading) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize());
            this._log("\x1b[34m" + text + "\x1b[0m");
        }
        else if (message.type == MessageType.Failure && !message.icon) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize(), "", "\x1b[31m");
            this._log("\x1b[31m" + text + "\x1b[0m");
        }
        else if (message.type == MessageType.Success && !message.icon) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize(), "", "\x1b[32m");
            this._log("\x1b[32m" + text + "\x1b[0m");
        }
        else {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize());
            this._log(text);
        }
    }

    error(err: Error) {
        let message = Resources.fatalError(err);
        this._log(message.toString(this._locale, ));
    }

    protected openRun(name: string, subscription: string): void {
        this.write(Resources.startRun(name, subscription));
    }

    protected openGroup(name: string, source: string): void {
        this.write(Resources.startGroup(name, source));
    }
    
    protected openTest(name: string): void {
        this.write(Resources.startTest(name));
    }
    
    protected writeAssert(message: AssertionMessage, resourceId: string, resourceName: string, expected: any, actual: any): void {
        this.write(message);
    }

    protected closeTest(): void {
    }

    protected closeGroup(name: string): void {
    }
    
    protected closeRun() : Array<Results.IAzuRunResult> {
        return new Array<Results.IAzuRunResult>();
    }

    public trackResource(resourceId: string, resourceName: string): void {}
}
import * as Globalization from "../i18n/locales";
import * as Results from "./results";
import { MessageType, AssertionMessage } from "../i18n/messages";

export interface IAzuLog {
    write(message: Globalization.IAzuCultureMessage): void;
    error(err: Error): void;

    startRun(name: string, subscription: string): void;
    startGroup(name: string, source: string): void;
    startTest(name: string): void;
    assert(message: AssertionMessage, resource: string, expected: any, actual: any): void;
    endTest(): void;
    endGroup(): void;
    endRun(): void;
    abortRun(message: string): void;
}

abstract class BaseLog implements IAzuLog {

    constructor(locale: Globalization.IAzuLocale) {
        this._locale = locale;
    }

    protected _locale: Globalization.IAzuLocale;

    private _stack = new Array();

    public abstract write(message: Globalization.IAzuCultureMessage): void;
    public abstract error(err: Error): void;

    public startRun(name: string, subscription: string): void {
        if (this._stack.length != 0) { throw new Error("Logging failure: a run had already been started."); }
        this.openRun(name, subscription);
        this._stack.push(name);
    }

    public startGroup(name: string, source: string): void {
        if (this._stack.length != 1) { throw new Error("Logging failure: a test group has already been started."); }
        this.openGroup(name, source);
        this._stack.push(name);
    }

    public startTest(name: string): void {
        if (this._stack.length != 2) { throw new Error("Logging failure: a test has already been started."); }
        this.openTest(name);
        this._stack.push(name);
    }
    
    public assert(message: AssertionMessage, expected: any, actual: any): void {
        if (this._stack.length != 3) { throw new Error("Logging failure: a test is not on the result stack."); }
        this.writeAssert(message, expected, actual);        
    }
    
    public endTest() {
        if (this._stack.length != 3) { throw new Error("Logging failure: a test is not on the result stack."); }
        this.closeTest();
        this._stack.pop();
    }
    public endGroup() {
        if (this._stack.length != 2) { throw new Error("Logging failure: a test group is not on the result stack."); }
        this.closeGroup();
        this._stack.pop();
    }

    public endRun() {
        if (this._stack.length != 1) { throw new Error("Logging failure: a test group is not on the result stack."); }
        this.closeRun();
        this._stack.pop();
    }

    public abortRun(message: string): void {
        if (this._stack.length == 3) {
            this.closeTest();
        }
        
        if (this._stack.length == 2) {
            this.closeGroup();
        }

        if (this._stack.length == 1) {
            this.closeRun();
        }
    }

    protected abstract openRun(name: string, subscription: string): void;
    protected abstract openGroup(name: string, source: string): void;
    protected abstract openTest(name: string): void;
    protected abstract writeAssert(message: AssertionMessage, expected: any, actual: any): void;
    protected abstract closeTest(): void;
    protected abstract closeGroup(): void;
    protected abstract closeRun(): void;
}

export class ConsoleLog extends BaseLog {


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

    protected openRun(name: string, subscription: string): void {
        this.write(Globalization.Resources.startRun(name, subscription));
    }

    protected openGroup(name: string, source: string): void {
        this.write(Globalization.Resources.startGroup(name, source));
    }
    
    protected openTest(name: string): void {
        this.write(Globalization.Resources.startTest(name));
    }
    
    protected writeAssert(message: AssertionMessage, expected: any, actual: any): void {
        this.write(message);
    }

    protected closeTest(): void {
        console.log("\t\tFinished test");
    }

    protected closeGroup(): void {
        console.log("\tFinished group");
    }
    
    protected closeRun(): void {
        console.log("Finished run");
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

    public dump(log: IAzuLog) {
        this._log.forEach(e => {
            log.write(e);
        });
    }
}

export class MultiLog implements IAzuLog {

    constructor(logs : Array<IAzuLog>) {
        this._logs = logs;
    }

    private _logs : Array<IAzuLog>;

    write(message: Globalization.IAzuCultureMessage): void {
        this._logs.forEach(l => l.write(message));
    }
    error(err: Error): void {
        this._logs.forEach(l => l.error(err));
    }
    startRun(name: string, subscription: string): void {
        this._logs.forEach(l => l.startRun(name, subscription));
    }
    startGroup(name: string, source: string): void {
        this._logs.forEach(l => l.startGroup(name, source));
    }
    startTest(name: string): void {
        this._logs.forEach(l => l.startTest(name));
    }
    assert(message: AssertionMessage, resource: string, expected: any, actual: any): void {
        this._logs.forEach(l => l.assert(message, resource, expected, actual));
    }
    endTest(): void {
        this._logs.forEach(l => l.endTest());
    }
    endGroup(): void {
        this._logs.forEach(l => l.endGroup());
    }
    endRun(): void {
        this._logs.forEach(l => l.endRun());
    }
    abortRun(message: string): void {
        this._logs.forEach(l => l.abortRun(message));
    }
}
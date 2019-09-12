import * as Globalization from "../i18n/locales";
import * as Results from "./results";
import { MessageType, AssertionMessage } from "../i18n/messages";

export interface IAzuLog {
    write(message: Globalization.IAzuCultureMessage): void;
    error(err: Error): void;

    startRun(name: string, subscription: string, start?: Date): void;
    startGroup(name: string, source: string, start?: Date): void;
    startTest(name: string, start?: Date): void;
    assert(message: AssertionMessage, resourceId: string, resourceName: string, expected: any, actual: any): void;
    endTest(): void;
    endGroup(): void;
    endRun(): Array<Results.IAzuRunResult>;
    abortRun(message: string): Array<Results.IAzuRunResult>;

    trackResource(resourceId: string, resourceName: string): void;
}

abstract class BaseLog implements IAzuLog {

    constructor(locale: Globalization.IAzuLocale) {
        this._locale = locale;
    }

    protected _locale: Globalization.IAzuLocale;

    private _stack = new Array();

    public abstract write(message: Globalization.IAzuCultureMessage): void;
    public abstract error(err: Error): void;

    protected getStackSize() {
        if (this._stack) {
            return this._stack.length;
        }

        return 0;
    }

    public startRun(name: string, subscription: string, start?: Date): void {
        if (this._stack.length != 0) { throw new Error("Logging failure: a run had already been started."); }
        this.openRun(name, subscription, start);
        this._stack.push(name);
    }

    public startGroup(name: string, source: string, start?: Date): void {
        if (this._stack.length != 1) { throw new Error("Logging failure: a test group has already been started."); }
        this.openGroup(name, source, start);
        this._stack.push(name);
    }

    public startTest(name: string, start?: Date): void {
        if (this._stack.length != 2) { throw new Error("Logging failure: a test has already been started."); }
        this.openTest(name, start);
        this._stack.push(name);
    }
    
    public assert(message: AssertionMessage, resourceId: string, resourceName: string, expected: any, actual: any): void {
        if (this._stack.length != 3) { throw new Error("Logging failure: a test is not on the result stack."); }
        this.writeAssert(message, resourceId, resourceName, expected, actual);        
    }
    
    public endTest() {
        if (this._stack.length != 3) { throw new Error("Logging failure: a test is not on the result stack."); }
        this.closeTest();
        this._stack.pop();
    }
    public endGroup(name?: string) {
        if (this._stack.length != 2) { throw new Error("Logging failure: a test group is not on the result stack."); }
        this.closeGroup();
        this._stack.pop();
    }

    public endRun() : Array<Results.IAzuRunResult> {
        if (this._stack.length != 1) { throw new Error("Logging failure: a test group is not on the result stack."); }
        let result = this.closeRun();
        this._stack.pop();

        return result;
    }

    public abortRun(message: string) : Array<Results.IAzuRunResult> {
        if (this._stack.length == 3) {
            this.closeTest();
        }
        
        if (this._stack.length == 2) {
            this.closeGroup();
        }

        if (this._stack.length == 1) {
            return this.closeRun();
        }

        return new Array<Results.IAzuRunResult>();
    }

    public abstract trackResource(resourceId: string, resourceName: string): void;

    protected abstract openRun(name: string, subscription: string, start?: Date): void;
    protected abstract openGroup(name: string, source: string, start?: Date): void;
    protected abstract openTest(name: string, start?: Date): void;
    protected abstract writeAssert(message: AssertionMessage, resourceId: string, resourceName: string, expected: any, actual: any): void;
    protected abstract closeTest(): void;
    protected abstract closeGroup(name?: string): void;
    protected abstract closeRun(): Array<Results.IAzuRunResult>;
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
        let tokenFormatter = (t: string, tokenStart?: string, tokenEnd?: string) => {
            let start = (tokenStart) ? tokenStart : "";
            let end = (tokenEnd) ? tokenEnd : "";
            return start + "\x1b[1m" + t + "\x1b[0m" + end;
        };

        // Errors need to print out red.
        if (message.type == MessageType.Error) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize());
            console.log("\x1b[31m" + text + "\x1b[0m");
        }
        else if (message.type == MessageType.Title) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize());
            console.log("\x1b[37m\x1b[4m\x1b[1m" + text + "\x1b[0m");
        }
        else if (message.type == MessageType.Heading) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize());
            console.log("\x1b[34m" + text + "\x1b[0m");
        }
        else if (message.type == MessageType.Failure && !message.icon) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize(), "", "\x1b[31m");
            console.log("\x1b[31m" + text + "\x1b[0m");
        }
        else if (message.type == MessageType.Success && !message.icon) {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize(), "", "\x1b[32m");
            console.log("\x1b[32m" + text + "\x1b[0m");
        }
        else {
            let text = message.toString(this._locale, iconFormatter, tokenFormatter, this.getStackSize());
            console.log(text);
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
    startRun(name: string, subscription: string, start?: Date): void {
        this._logs.forEach(l => l.startRun(name, subscription, start));
    }
    startGroup(name: string, source: string, start?: Date): void {
        this._logs.forEach(l => l.startGroup(name, source, start));
    }
    startTest(name: string, start?: Date): void {
        this._logs.forEach(l => l.startTest(name, start));
    }
    assert(message: AssertionMessage, resourceId: string, resourceName: string, expected: any, actual: any): void {
        this._logs.forEach(l => l.assert(message, resourceId, resourceName, expected, actual));
    }
    endTest(): void {
        this._logs.forEach(l => l.endTest());
    }
    endGroup(): void {
        this._logs.forEach(l => l.endGroup());
    }
    endRun(): Array<Results.IAzuRunResult> {
        let allResults = new Array<Results.IAzuRunResult>();

        this._logs.forEach(l => { 
            let results = l.endRun();
            results.forEach(result => allResults.push(result));
        });

        return allResults;
    }
    abortRun(message: string): Array<Results.IAzuRunResult> {
        let allResults = new Array<Results.IAzuRunResult>();

        this._logs.forEach(l => { 
            let results = l.abortRun(message);
            results.forEach(result => allResults.push(result));
        });

        return allResults;
    }

    public trackResource(resourceId: string, resourceName: string): void {
        this._logs.forEach(l => l.trackResource(resourceId, resourceName));
    }
}

export class ResultsLog extends BaseLog {

    private _run: (Results.AzuRunResult | null) = null;
    private _group: (Results.AzuGroupResult | null) = null;
    private _test: (Results.AzuTestResult | null) = null;

    write(message: Globalization.IAzuCultureMessage) {
        
    }

    error(err: Error) {
        let message = Globalization.Resources.fatalError(err);
        console.log(message.toString(this._locale, ));
    }

    public trackResource(resourceId: string, resourceName: string): void {
        if (this._run) {
            this._run.resources.push(new Results.AzuResourceResult(resourceId, resourceName, 0));
        }
    }

    protected openRun(name: string, subscription: string, start?: Date): void {
        this._run = new Results.AzuRunResult(name, subscription, start);
    }

    protected openGroup(name: string, source: string, start?: Date): void {
        this._group = new Results.AzuGroupResult(name, source, start);
    }
    
    protected openTest(name: string, start?: Date): void {
        this._test = new Results.AzuTestResult(name, start);
    }
    
    protected writeAssert(message: AssertionMessage, resourceId: string, resourceName: string, expected: any, actual: any): void {

        // Strip icons and don't augment tokens
        let iconFormatter = (i: string, t: MessageType) => { return ""; };
        let tokenFormatter = (t: string) => { return t; };

        let assertion = new Results.AzuAssertionResult(message.state, message.toString(this._locale, iconFormatter, tokenFormatter));

        if (this._run) {
            
            let resource = null;

            for (let i=0; i<this._run.resources.length; i++) {
                let testResource = this._run.resources[i];
                if (testResource && testResource.id == resourceId) {
                    resource = testResource;
                    break;
                }
            }

            if (resource) {
                resource.assertions++;
            }
        }

        if (this._test) {
            this._test.assertions.push(assertion);
        }
    }

    protected closeTest(): void {
        if (this._group && this._test) {
            this._test.end = new Date();
            this._group.tests.push(this._test);
            this._test = null;
        }
    }

    protected closeGroup(): void {
        if (this._run && this._group) {
            this._group.end = new Date();
            this._run.groups.push(this._group);
            this._group = null;
        }
    }
    
    protected closeRun(): Array<Results.IAzuRunResult> {
        if (this._run) {
            this._run.end = new Date();
            let results = new Array<Results.IAzuRunResult>();
            results.push(this._run);
            return results;
        }

        return new Array<Results.IAzuRunResult>();
    }
}
import * as Results from "../azunit-results";
import * as Globalization from "../azunit-globalization";
import { IAzuLog } from "./IAzuLog";
import { IAzuCultureMessage, AssertionMessage } from "../azunit-i18n";

export abstract class BaseLog implements IAzuLog {

    constructor(locale: Globalization.IAzuLocale) {
        this._locale = locale;
    }

    protected _locale: Globalization.IAzuLocale;

    private _stack = new Array();

    public abstract write(message: IAzuCultureMessage): void;
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
import * as Results from "../azunit.results";
import { IAzuLog } from "./IAzuLog";
import { IAzuCultureMessage, AssertionMessage } from "../azunit.globalization.messages";

export class MultiLog implements IAzuLog {

    constructor(logs : Array<IAzuLog>) {
        this._logs = logs;
    }

    private _logs : Array<IAzuLog>;

    write(message: IAzuCultureMessage): void {
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
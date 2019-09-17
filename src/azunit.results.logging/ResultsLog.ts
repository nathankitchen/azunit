import * as Results from "../azunit.results";
import { BaseLog } from "./BaseLog";
import { IAzuCultureMessage, Resources, AssertionMessage, MessageType } from "../azunit.globalization.messages";

export class ResultsLog extends BaseLog {

    private _run: (Results.AzuRunResult | null) = null;
    private _group: (Results.AzuGroupResult | null) = null;
    private _test: (Results.AzuTestResult | null) = null;

    write(message: IAzuCultureMessage) {
        
    }

    error(err: Error) {
        let message = Resources.fatalError(err);
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
import { BaseAzuEvaluator } from "./BaseAzuEvaluator";
import { IAzuGroupResult } from "./IAzuGroupResult";
import { IAzuTestResult } from "./IAzuTestResult";
import { AzuState } from "../azunit-core";

export class AzuGroupResult extends BaseAzuEvaluator implements IAzuGroupResult {
    
    constructor(name: string, source: string, start?: Date) {
        super(start);
        this.name = name;
        this.source = source;
    }

    public readonly name: string;
    public readonly source: string;
    public readonly tests: Array<IAzuTestResult> = new Array<IAzuTestResult>();

    getState() : AzuState { return this.evalState(this.tests); }

    public getTestCount(): number { return this.tests.length; }
    public getTestFailureCount(): number  { return this.tests.filter((i) => { return i.getState() == AzuState.Failed; }).length; }
    public getTestPassCount(): number  { return this.tests.filter((i) => { return i.getState() == AzuState.Passed; }).length; }
}
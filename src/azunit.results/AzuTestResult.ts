import { IAzuTestResult } from "./IAzuTestResult";
import { IAzuAssertionResult } from "./IAzuAssertionResult";
import { AzuExecution } from "../azunit/AzuExecution";
import { AzuState } from "../azunit/AzuState";
import { BaseAzuEvaluator } from "./BaseAzuEvaluator";

export class AzuTestResult extends BaseAzuEvaluator implements IAzuTestResult {

    constructor(name: string, start?: Date) {
        super(start);
        this.name = name;
    }

    public readonly name: string;
    public readonly assertions: Array<IAzuAssertionResult> = new Array<IAzuAssertionResult>();
    public execution: AzuExecution = AzuExecution.Complete;

    getState() : AzuState { return this.evalState(this.assertions); }
}
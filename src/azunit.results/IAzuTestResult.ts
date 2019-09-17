import { AzuExecution } from "../azunit";
import { IAzuRunEvaluator } from "./IAzuRunEvaluator";
import { IAzuAssertionResult } from "./IAzuAssertionResult";

export interface IAzuTestResult extends IAzuRunEvaluator {
    name: string;
    execution: AzuExecution;
    assertions: Array<IAzuAssertionResult>;
}
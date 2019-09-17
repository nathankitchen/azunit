import { IAzuRunEvaluator } from "./IAzuRunEvaluator";
import { IAzuTestResult } from "./IAzuTestResult";

export interface IAzuGroupResult extends IAzuRunEvaluator {
    name: string;
    source: string;
    tests: Array<IAzuTestResult>;
    getTestCount(): number;
    getTestFailureCount(): number;
    getTestPassCount(): number;
}
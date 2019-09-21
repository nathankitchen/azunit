import { IAzuRunEvaluator } from "./IAzuRunEvaluator";
import { IAzuGroupResult } from "./IAzuGroupResult";
import { IAzuResourceResult } from "./IAzuResourceResult";

export interface IAzuRunResult extends IAzuRunEvaluator {
    readonly name: string;
    readonly subscription: string;
    readonly groups: Array<IAzuGroupResult>;
    readonly resources: Array<IAzuResourceResult>;
    getTestCount(): number;
    getTestFailureCount(): number;
    getTestPassCount(): number;
}
import { IAzuRunEvaluator } from "./IAzuRunEvaluator";

export interface IAzuAssertionResult extends IAzuRunEvaluator {
    message: string;
}
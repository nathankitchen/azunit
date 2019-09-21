import { AzuState } from "../azunit";

/**
 * Common operations across test results: we should be able to check for
 * success at the assertion, test, file, and run levels.
 */
export interface IAzuRunEvaluator {
    readonly start: Date;
    end?: Date;
    getDurationSeconds() : number;
    getState() : AzuState;
}
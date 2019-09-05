/**
 * Defines three states that a test can be in: passed, failed, or ignored.
 * Ignored is used for empty tests (no assertions) or if the test is marked
 * to be skipped.
 */
export enum AzuState {
    Ignored,
    Passed,
    Failed
}

/**
 * Common operations across test results: we should be able to check for
 * success at the assertion, test, file, and run levels.
 */
export interface IAzuRunEvaluator {
    getState() : AzuState;
}

export interface IAzuAssertionResult extends IAzuRunEvaluator {
    message: string;
}

export interface IAzuTestResult extends IAzuRunEvaluator {
    title: string;
    readonly start: Date;
    duration: number;
    assertions: Array<IAzuAssertionResult>;
}

export interface IAzuFileResult extends IAzuRunEvaluator {
    title: string;
    readonly start: Date;
    duration: number;
    filename: string;
    tests: Array<IAzuTestResult>;
}

export interface IAzuRunResult extends IAzuRunEvaluator {
    title: string;
    subscription: string;
    readonly start: Date;
    duration: number;
    files: Array<IAzuFileResult>;
}

export abstract class AzuBaseEvaluator implements IAzuRunEvaluator {
    abstract getState(): AzuState;

    protected evalState(set: Array<IAzuRunEvaluator>) {
        let state = AzuState.Ignored;

        if (set) {
            for (let i=0; i<set.length; i++) {

                // If any of the children have failed, then the
                // aggregate item has failed too.
                if (set[i].getState() == AzuState.Failed) {
                    state = AzuState.Failed;
                    break;
                }

                // If any of the children have passed, then the
                // aggregate item is not ignored.
                else if (set[i].getState() == AzuState.Passed) {
                    state = AzuState.Passed;
                }
            }
        }

        return state;
    }
}

export class AzuRunResult extends AzuBaseEvaluator implements IAzuRunResult {
    title: string = "";
    subscription: string = "";
    readonly start: Date = new Date();
    duration: number = 0;
    files: IAzuFileResult[] = new Array();

    getState() : AzuState { return this.evalState(this.files); }
}

export class AzuFileResult extends AzuBaseEvaluator implements IAzuFileResult {
    title: string = "";
    filename: string = "";
    readonly start: Date = new Date();
    duration: number = 0;
    tests: IAzuTestResult[] = new Array();

    getState() : AzuState { return this.evalState(this.tests); }
}

export class AzuTestResult extends AzuBaseEvaluator implements IAzuTestResult {
    title: string = "";
    readonly start: Date = new Date();
    duration: number = 0;

    assertions: Array<IAzuAssertionResult> = new Array<IAzuAssertionResult>();
    
    getState() : AzuState { return this.evalState(this.assertions); }
}

export class AzuAssertionResult extends AzuBaseEvaluator implements IAzuAssertionResult {
    
    constructor(state: AzuState, message: string) {
        super();
        this.message = message;
        this._state = state;
    }

    readonly message: string = "";
    
    private _state: AzuState;
    
    getState() : AzuState { return this._state; }
}
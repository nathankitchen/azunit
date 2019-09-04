/**
 * Common operations across test results: we should be able to check for
 * success at the assertion, test, file, and run levels.
 */
export interface IAzuRunEvaluator {
    isSuccess() : boolean;
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

export class AzuRunResult implements IAzuRunResult {
    title: string = "";
    subscription: string = "";
    readonly start: Date = new Date();
    duration: number = 0;
    files: IAzuFileResult[] = new Array();

    isSuccess() : boolean {
        let success = true;

        if (this.files) {
            this.files.forEach(t => {
                if (!t.isSuccess()) { success = false; }
            });
        }
        
        return success;
    }
}

export class AzuFileResult implements IAzuFileResult {
    title: string = "";
    filename: string = "";
    readonly start: Date = new Date();
    duration: number = 0;

    tests: IAzuTestResult[] = new Array();
    isSuccess() {
        let success = true;

        if (this.tests) {
            this.tests.forEach(t => {
                if (!t.isSuccess()) { success = false; }
            });
        }
        
        return success;
    }
}

export class AzuTestResult implements IAzuTestResult {
    title: string = "";
    readonly start: Date = new Date();
    duration: number = 0;

    assertions: Array<IAzuAssertionResult> = new Array<IAzuAssertionResult>();
    
    isSuccess() {
        let success = true;

        if (this.assertions) {
            this.assertions.forEach(a => {
                if (!a.isSuccess()) { success = false; }
            });
        }

        return success;
    }
}

export class AzuAssertionResult implements IAzuAssertionResult {
    
    constructor(success: boolean, message: string) {
        this.message = message;
        this._success = success;
    }

    readonly message: string = "";
    
    private _success: boolean;
    
    isSuccess() {
        return this._success;
    }
}
/**
 * Common operations across test results: we should be able to check for
 * success at the assertion, test, and subscription levels.
 */
export interface IAzuRunEvaluator {
    isSuccess() : boolean;
}

export interface IAzuAssertionResult extends IAzuRunEvaluator {
    message: string;
}

export interface IAzuTestResult extends IAzuRunEvaluator {
    title: string;
    assertions: Array<IAzuAssertionResult>;
}

export interface IAzuSubscriptionResult extends IAzuRunEvaluator {
    id: string;
    name: string;
    tests: Array<IAzuTestResult>;
}

export class AzuSubcriptionResult implements IAzuSubscriptionResult {
    id: string = "";
    name: string = "";
    tests: IAzuTestResult[] = new Array();
    isSuccess() {
        let success = true;

        this.tests.forEach(t => {
            if (!t.isSuccess()) { success = false; }
        });
        
        return success;
    }
}

export class AzuTestResult implements IAzuTestResult {
    title: string = "";
    assertions: Array<IAzuAssertionResult> = new Array<IAzuAssertionResult>();
    
    isSuccess() {
        let success = true;

        this.assertions.forEach(a => {
            if (!a.isSuccess()) { success = false; }
        });

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
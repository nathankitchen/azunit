import { IAzuAssertionResult } from "./IAzuAssertionResult";
import { AzuState } from "../azunit-core";
import { BaseAzuEvaluator } from "./BaseAzuEvaluator";

export class AzuAssertionResult extends BaseAzuEvaluator implements IAzuAssertionResult {
    
    constructor(state: AzuState, message: string) {
        super();
        this.message = message;
        this._state = state;
    }

    public readonly message: string;

    private _state: AzuState;
    
    getState() : AzuState { return this._state; }
}
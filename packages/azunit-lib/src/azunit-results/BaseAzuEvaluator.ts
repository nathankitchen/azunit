import { IAzuRunEvaluator } from "./IAzuRunEvaluator";
import { AzuState } from "../azunit-core";

export abstract class BaseAzuEvaluator implements IAzuRunEvaluator {
    
    constructor(start?: Date){
        this.start = (start) ? start : new Date();
        this.end = undefined;
    }

    public readonly start: Date;
    public end?: Date;

    public getDurationSeconds(): number {
        if (this.end) {
            return (this.end.getTime() - this.start.getTime()) / 1000;
        }

        return 0;
    }

    abstract getState(): AzuState;

    protected evalState(set: Array<IAzuRunEvaluator>) {
        let state = AzuState.Ignored;

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

        return state;
    }
}
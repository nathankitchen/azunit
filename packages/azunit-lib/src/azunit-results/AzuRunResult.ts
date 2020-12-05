import { BaseAzuEvaluator } from "./BaseAzuEvaluator";
import { IAzuRunResult } from "./IAzuRunResult";
import { IAzuGroupResult } from "./IAzuGroupResult";
import { IAzuResourceResult } from "./IAzuResourceResult";
import { AzuState } from "../azunit-core";

export class AzuRunResult extends BaseAzuEvaluator implements IAzuRunResult {

    constructor(name: string, subscription: string, start?: Date) {
        super(start);
        this.name = name;
        this.subscription = subscription;
    }

    public readonly name: string;
    public readonly subscription: string;
    public readonly groups: Array<IAzuGroupResult> = new Array<IAzuGroupResult>();
    public readonly resources: Array<IAzuResourceResult> = new Array<IAzuResourceResult>();

    public getState() : AzuState { return this.evalState(this.groups); }

    public getTestCount(): number { return this.groups.reduce( (a,b) => { return a+b.getTestCount(); }, 0); }
    public getTestFailureCount(): number  { return this.groups.reduce( (a,b) => { return a+b.getTestFailureCount(); }, 0); }
    public getTestPassCount(): number  { return this.groups.reduce( (a,b) => { return a+b.getTestPassCount(); }, 0); }
}
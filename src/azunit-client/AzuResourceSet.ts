import * as Logging from "../azunit.results.logging";

import { IAzuValue } from "./IAzuValue";
import { IAzuTestable } from "./IAzuTestable";
import { AzuResource } from "./AzuResource";
import { AzuValue } from "./AzuValue";
import { AzuValueSet } from "./AzuValueSet";

export class AzuResourceSet implements IAzuTestable {

    constructor(log: Logging.IAzuLog, resources: Array<AzuResource>) {
        this._resources = resources;
        this._log = log;
        
        let values = new Array<IAzuValue>();

        this._resources.forEach(r => values.push(new AzuValue(log, r.id, r.name, "Instance count", this._resources.length)));
        
        this.shouldHaveInstanceCount = new AzuValueSet("Instance count", values, log);
    }

    public shouldHaveInstanceCount : IAzuValue;

    private _resources: Array<AzuResource>;
    private _log: Logging.IAzuLog;

    shouldHaveProperty(selector: string) {

        let valueSet = new Array<IAzuValue>();

        this._resources.forEach(r => {
            valueSet.push(r.shouldHaveProperty(selector));
        });

        return new AzuValueSet(selector, valueSet, this._log);
    }
}
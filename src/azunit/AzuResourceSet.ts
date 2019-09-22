import * as Logging from "../azunit-results-logging";

import { IAzuValue } from "../azunit-client/IAzuValue";
import { IAzuTestable } from "../azunit-client/IAzuTestable";
import { IAzuResource } from "../azunit-client/IAzuResource";
import { AzuValue } from "./AzuValue";
import { AzuValueSet } from "./AzuValueSet";

export class AzuResourceSet implements IAzuTestable {

    constructor(log: Logging.IAzuLog, resources: Array<IAzuResource>) {
        this._resources = resources;
        this._log = log;
        
        let values = new Array<IAzuValue>();

        this._resources.forEach(r => values.push(new AzuValue(log, r.id, r.name, "Instance count", this._resources.length)));
        
        this.shouldHaveInstanceCount = new AzuValueSet("Instance count", values, log);
    }

    public shouldHaveInstanceCount : IAzuValue;

    private _resources: Array<IAzuResource>;
    private _log: Logging.IAzuLog;

    shouldHaveProperty(selector: string) {

        let valueSet = new Array<IAzuValue>();

        this._resources.forEach(r => {
            valueSet.push(r.shouldHaveProperty(selector));
        });

        return new AzuValueSet(selector, valueSet, this._log);
    }
}
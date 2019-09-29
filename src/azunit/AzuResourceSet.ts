import * as Logging from "../azunit-results-logging";

import { IAzuAppResource } from "./IAzuAppResource";
import { IAzuValue } from "../azunit-client/IAzuValue";
import { IAzuTestable } from "../azunit-client/IAzuTestable";
import { AzuValue } from "./AzuValue";
import { AzuValueSet } from "./AzuValueSet";

export class AzuResourceSet implements IAzuTestable {

    constructor(log: Logging.IAzuLog, resources: Array<IAzuAppResource>) {
        this._resources = resources;
        this._log = log;
        
        let values = new Array<IAzuValue>();

        this._resources.forEach(r => values.push(new AzuValue(log, r.id, r.name, "Instance count", this._resources.length)));
        
        this.shouldHaveInstanceCount = new AzuValueSet("Instance count", values, log);
    }

    public shouldHaveInstanceCount : IAzuValue;

    private _resources: Array<IAzuAppResource>;
    private _log: Logging.IAzuLog;

    shouldHaveProperty(selector: string) {

        let valueSet = new Array<IAzuValue>();

        this._resources.forEach(r => {
            valueSet.push(r.shouldHaveProperty(selector));
        });

        return new AzuValueSet(selector, valueSet, this._log);
    }

    public getData(): Array<any> {
        const data = new Array<any>();
        this._resources.forEach(r => {
            const subdata = r.getData();
            subdata.forEach(s => {
                data.push(s);
            });
        });
        return data;
    }
}
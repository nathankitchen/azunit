import * as Client from "../azunit-client"
import * as Logging from "../azunit-results-logging";

import { AzuValue } from "./AzuValue";

import JsonPath from "jsonpath";

export class AzuResource implements Client.IAzuResource {

    constructor(log: Logging.IAzuLog, resource: any) {
        this._log = log;
        this.id = resource.id;
        this.name = resource.name;
        this.provider = resource.type;
        this.resourceGroup = resource.resourceGroup;
        this._resource = resource;
        this.shouldHaveInstanceCount = new AzuValue(log, this.id, this.name, "instance count", 1);
    }

    public readonly id: string = "";
    public readonly name: string = "";
    public readonly provider: string = "";
    public readonly resourceGroup: string = "";

    public shouldHaveInstanceCount : Client.IAzuValue

    private _log: Logging.IAzuLog;

    private _resource: any;

    shouldHaveProperty(selector: string) : Client.IAzuValue {
        let match = JsonPath.query(this._resource, selector);
        return new AzuValue(this._log, this.id, this.name, selector, match);
    }
}
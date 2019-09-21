import { IAzuValue } from "./IAzuValue";
import { AzuValue } from "./AzuValue";
import { IAzuTestable } from "./IAzuTestable";
import JsonPath from "jsonpath";

export class AzuResource implements IAzuTestable {

    constructor(services: Main.IAzuServices, resource: any) {
        this._services = services;
        this.id = resource.id;
        this.name = resource.name;
        this.provider = resource.type;
        this.type = resource.type;
        this._resource = resource;
        this.shouldHaveInstanceCount = new AzuValue(services, this.id, this.name, "instance count", 1);
    }

    public id: string = "";
    public name: string = "";
    public provider: string = "";
    public type: string = "";

    public shouldHaveInstanceCount : IAzuValue

    private _services: Main.IAzuServices;

    private _resource: any;

    shouldHaveProperty(selector: string) : IAzuValue {
        let match = JsonPath.query(this._resource, selector);
        return new AzuValue(this._services, this.id, this.name, selector, match);
    }
}
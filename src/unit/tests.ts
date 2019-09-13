import * as Client from "./client";
import * as Main from "../main";
import * as Globalization from "../azunit.globalization.messages/Resources";
import { IAzuLog } from "../io/log";

import JsonPath from "jsonpath";

class AzuClientLog implements Client.IAzuClientLog {

    constructor(log: IAzuLog) {
        this._log = log;
    }

    private _log: IAzuLog;

    trace(message: string) : void {
        this._log.write(Globalization.Resources.clientTrace(message));
    }

    write(message: string) : void {
        this._log.write(Globalization.Resources.clientText(message));
    }

    warning(message: string) : void {
        this._log.write(Globalization.Resources.clientWarning(message));
    }

    error(message: string) : void {
        this._log.write(Globalization.Resources.clientError(message));
    }
}

export class AzuTest implements Client.IAzuTest {

    constructor (services: Main.IAzuServices, title: string, resources: Array<AzuResource>) {
        this._services = services;
        this._resources = resources;

        this.log = new AzuClientLog(this._services.log);
    }

    public title: string = "";
    public description: string = "";
    public ignore: boolean = false;
    public readonly categories: Array<string> = new Array<string>();

    public readonly log: Client.IAzuClientLog;

    private _resources: Array<AzuResource>;
    private _services: Main.IAzuServices;

    selectResourcesByProvider(provider: string) : Client.IAzuTestable {
        return new AzuResourceSet(this._services, this._resources.filter(r => r.provider.toLowerCase() === provider.toLocaleLowerCase()));
    }
    
    selectResourcesByName(name: string) : Client.IAzuTestable  {
        return new AzuResourceSet(this._services, this._resources.filter(r => r.name.toLowerCase() === name.toLowerCase()));
    }
}

export class AzuResource implements Client.IAzuTestable {

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

    public shouldHaveInstanceCount : Client.IAzuValue

    private _services: Main.IAzuServices;

    private _resource: any;

    shouldHaveProperty(selector: string) : Client.IAzuValue {
        let match = JsonPath.query(this._resource, selector);
        return new AzuValue(this._services, this.id, this.name, selector, match);
    }
}

export class AzuResourceSet implements Client.IAzuTestable {

    constructor(services: Main.IAzuServices, resources: Array<AzuResource>) {
        this._resources = resources;
        this._services = services;
        
        let values = new Array<Client.IAzuValue>();

        this._resources.forEach(r => values.push(new AzuValue(services, r.id, r.name, "Instance count", this._resources.length)));
        
        this.shouldHaveInstanceCount = new AzuValueSet("Instance count", values, services);
    }

    public shouldHaveInstanceCount : Client.IAzuValue;

    private _resources: Array<AzuResource>;
    private _services: Main.IAzuServices;

    shouldHaveProperty(selector: string) {

        let valueSet = new Array<Client.IAzuValue>();

        this._resources.forEach(r => {
            valueSet.push(r.shouldHaveProperty(selector));
        });

        return new AzuValueSet(selector, valueSet, this._services);
    }
}

export class AzuValue implements Client.IAzuValue {

    constructor(services: Main.IAzuServices, resourceId: string, resourceName: string, name: string, value: any) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.name = name;
        this._actual = value;
        this._services = services;
    }

    public readonly resourceId: string = "";
    public readonly resourceName: string = "";
    public readonly name: string = "";

    private _services : Main.IAzuServices;
    private _printName : string = "";
    private _actual : any = "";

    as(name: string) {
        this._printName = name;
        return this;
    }

    disabled() {
        let message = (this._actual === false) ?

        Globalization.Resources.getAssertionDisabledSuccessMessage(this.getName(), this.resourceName, this._actual):
        Globalization.Resources.getAssertionDisabledFailureMessage(this.getName(), this.resourceName, this._actual);

        this._services.log.assert(message, this.resourceId, this.resourceName, false, this._actual);
     }
    
    enabled() {
        let message = (this._actual) ?
            Globalization.Resources.getAssertionEnabledSuccessMessage(this.getName(), this.resourceName, this._actual):
            Globalization.Resources.getAssertionEnabledFailureMessage(this.getName(), this.resourceName, this._actual);

        this._services.log.assert(message, this.resourceId, this.resourceName, true, this._actual);
    }

    equals(expected : string | number | boolean) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._services.log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     arrayContains(expected : string | number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._services.log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     greaterThan(expected : number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._services.log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     greaterThanOrEqual(expected : number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._services.log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     lessThan(expected : string | number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._services.log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     lessThanOrEqual(expected : string | number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._services.log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     protected getName() {
        return (this._printName) ? this._printName : this.name;
    }
}

export class AzuValueSet implements Client.IAzuValue {

    constructor(name: string, values: Array<Client.IAzuValue>, services: Main.IAzuServices) {
        this.name = name;
        this._actual = values;

        if (!this._actual.length) {
            this._actual.push(new AzuValue(services, "", "", this.name, 0));
        }
    }

    public name: string = "";

    private _actual : Array<Client.IAzuValue>;

    as(name: string) {
        this._actual.forEach(v => {
            v.as(name);
        });

        return this;
    }

    disabled() {
        this._actual.forEach(v => {
            v.disabled();
        });
    }
    
    enabled() {
        this._actual.forEach(v => {
            v.enabled();
        });
    }

    equals(expected : any) {
        this._actual.forEach(v => {
            v.equals(expected);
        });
     }
}
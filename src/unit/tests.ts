import * as Client from "./client";
import * as Main from "../main";
import * as Globalization from "../i18n/locales";

const JsonPath = require("jsonpath");

export class AzuTest implements Client.IAzuTest {

    constructor (settings: Main.IAzuSettings, title: string, resources: Array<AzuResource>) {
        this._settings = settings;
        this.title = title;
        this._resources = resources;
    }

    public title: string = "";

    private _resources: Array<AzuResource>;
    private _settings: Main.IAzuSettings;

    selectByProvider(provider: string) {
        return new AzuResourceSet(this._settings, this._resources.filter(r => r.provider.toLowerCase() === provider.toLocaleLowerCase()));
    }
    
    selectByName(name: string) {
        return new AzuResourceSet(this._settings, this._resources.filter(r => r.name.toLowerCase() === name.toLowerCase()));
    }

    selectApproved() {
        return new AzuResourceSet(this._settings, this._resources.filter(r => r.isApproved()));
    }

    selectUnapproved() {
        return new AzuResourceSet(this._settings, this._resources);
    }

}

export class AzuResource implements Client.IAzuTestable {

    constructor(settings: Main.IAzuSettings, resource: any) {
        this._settings = settings;
        this._id = resource.id;
        this.name = resource.name;
        this.provider = resource.type;
        this.type = resource.type;
        this._resource = resource;
        this.shouldHaveInstanceCount = new AzuValue(settings, this._id, "instance count", 1);
    }

    public name: string = "";
    public provider: string = "";
    public type: string = "";

    public shouldHaveInstanceCount : Client.IAzuValue

    private _settings: Main.IAzuSettings;

    private _id: string = "";
    private _resource: any;
    private _approved: boolean = false;

    shouldHaveProperty(selector: string) {
        let match = JsonPath.query(this._resource, selector);
        return new AzuValue(this._settings, this.name, selector, match);
    }

    approve(message?: string) {
        if (!this._approved) {
            let logMessage = "Resource " + this.name + " has been approved";
            
            if (message) {
                logMessage += " (" + message + ")";
            }
            else {
                logMessage += "!";
            }

            //this._settings.log.write(logMessage);
            this._approved = true;
        }
    }

    isApproved() {
        return this._approved;
    }
}

export class AzuResourceSet implements Client.IAzuTestable {

    constructor(settings: Main.IAzuSettings, resources: Array<Client.IAzuTestable>) {
        this._resources = resources;
        this._settings = settings;
        this.shouldHaveInstanceCount = new AzuValue(settings, "", "Instance count", this._resources.length);
    }

    public shouldHaveInstanceCount : Client.IAzuValue;

    private _resources: Array<Client.IAzuTestable>;
    private _settings: Main.IAzuSettings;

    shouldHaveProperty(selector: string) {

        let valueSet = new Array<Client.IAzuValue>();

        this._resources.forEach(r => {
            valueSet.push(r.shouldHaveProperty(selector));
        });

        return new AzuValueSet(selector, valueSet, this._settings);
    }

    approve(message?: string) {
        this._resources.forEach((r) => {
            r.approve(message);
        });
    }

    isApproved() {
        this._resources.forEach((r) => {
            if (!r.isApproved()) {
                return false;
            }
        });

        return true
    }
}

export class AzuValue implements Client.IAzuValue {

    constructor(settings: Main.IAzuSettings, resourceName: string, name: string, value: any) {
        this.resourceName = resourceName;
        this.name = name;
        this._actual = value;
        this._settings = settings;
    }

    public readonly resourceName: string = "";

    public readonly name: string = "";

    private _printName : string = "";
    private _actual : any = "";
    private _settings : Main.IAzuSettings;


    as(name: string) {
        this._printName = name;
        return this;
    }

    disabled() {
        let message = (!this._actual) ?

        Globalization.Resources.getAssertionDisabledSuccessMessage(this.getName(), this.resourceName, this._actual):
        Globalization.Resources.getAssertionDisabledFailureMessage(this.getName(), this.resourceName, this._actual);

        this._settings.log.assert(message, this.resourceName, false, this._actual);
     }
    
    enabled() {
        let message = (this._actual) ?
            Globalization.Resources.getAssertionEnabledSuccessMessage(this.getName(), this.resourceName, this._actual):
            Globalization.Resources.getAssertionEnabledFailureMessage(this.getName(), this.resourceName, this._actual);

        this._settings.log.assert(message, this.resourceName, true, this._actual);
    }

    equals(expected : string | number | boolean) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._settings.log.assert(message, this.resourceName, expected, this._actual);
     }

     arrayContains(expected : string | number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._settings.log.assert(message, this.resourceName, expected, this._actual);
     }

     greaterThan(expected : number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._settings.log.assert(message, this.resourceName, expected, this._actual);
     }

     greaterThanOrEqual(expected : number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._settings.log.assert(message, this.resourceName, expected, this._actual);
     }

     lessThan(expected : string | number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._settings.log.assert(message, this.resourceName, expected, this._actual);
     }

     lessThanOrEqual(expected : string | number) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._settings.log.assert(message, this.resourceName, expected, this._actual);
     }

     protected getName() {
        return (this._printName) ? this._printName : this.name;
    }
}

export class AzuValueSet implements Client.IAzuValue {

    constructor(name: string, values: Array<Client.IAzuValue>, settings: Main.IAzuSettings) {
        this.name = name;
        this._actual = values;

        if (!this._actual.length) {
            this._actual.push(new AzuValue(settings, "", this.name, undefined));
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
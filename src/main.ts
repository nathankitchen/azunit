import * as Results from "./io/results";
import * as Abstractions from "./azure/abstractions";
import * as Globalization from "./i18n/locales";
import * as Log from "./io/log";
import * as Client from "./client";
import { resolve } from "url";

const JsonPath = require("jsonpath");

type AzuRunFunc = (context: IAzuRunContext) => Promise<Array<Results.IAzuFileResult>>;
type AzuFileFunc = (subscription: IAzuTestContext) => Promise<Results.IAzuFileResult>;

interface IAzuApp {
    useServicePrincipal(tenant: string, principalId: string, secret: string) : Promise<IAzuPrincipal>;
}

interface IAzuPrincipal {
    getSubscription(id : string) : Promise<IAzuSubscription>;
}

interface IAzuSubscription {
    createTestRun(name: string, callback: AzuRunFunc): Promise<Results.IAzuRunResult>;
}

interface IAzuTestRun {
    runTests(tests: Client.AzuTestFunc): Promise<Array<Results.IAzuTestResult>>;
}



class AzuApp implements IAzuApp {

    constructor(settings: IAzuSettings) {
        this._settings = settings;
        this._settings.log.write(Globalization.Resources.title());
    }

    private _settings: IAzuSettings;

    useServicePrincipal(tenant: string, clientId: string, secret: string) {

        return new Promise<IAzuPrincipal>(

            (resolve, reject) => {

                this._settings.log.write(Globalization.Resources.statusTenant(tenant));

                this._settings.authenticator.getSPTokenCredentials(tenant, clientId, secret)
                .then((token) => {
                    let run = new AzuPrincipal(this._settings, token);
                    resolve(run);
                })
                .catch((err) => { reject(err); });
            }
        );
    }
}

class AzuPrincipal implements IAzuPrincipal {

    constructor(settings: IAzuSettings, token: Abstractions.IAzureToken) {
        this._settings = settings;
        this._token = token;
    }

    private _settings: IAzuSettings;
    private _token: Abstractions.IAzureToken;

    /**
    * Loads a subscription and allows tests to be run on its resources.
    * @param subscriptionId The ID of the subscription to load resources for.
    * @param callback The tests to run over the subscription.
    * @returns The test run, allowing test chaining.
    */
    getSubscription(subscriptionId: string) {

        return new Promise<IAzuSubscription>((resolve, reject) => {
        
            this._settings.log.write(Globalization.Resources.statusSubscription(subscriptionId));

            this._settings.resourceProvider.list(subscriptionId, this._token)

            .then((data: Array<any>) => {
                let resources = new Array<AzuResource>();

                data.forEach(r => {
                    resources.push(new AzuResource(this._settings, r));            
                });
                
                let sub = new AzuSubscription(this._settings, resources);

                resolve(sub);
            })
            .catch((err: Error) => { reject(err); });
        });
        
    };
}

class AzuSubscription implements IAzuSubscription {
    
    constructor (settings: IAzuSettings, resources: Array<AzuResource>) {
        this._settings = settings;
        this._resources = resources;
    }

    private _resources: Array<AzuResource>;
    private _settings: IAzuSettings;

    createTestRun(name: string, callback: AzuRunFunc) : Promise<Results.IAzuRunResult> {

        this._settings.log.startRun(name, "CLI");

        let context = new AzuRunContext(this._settings, this._resources);

        return callback(context)
            .then((files: Array<Results.IAzuFileResult>) => {
                let result = new Results.AzuRunResult();
                result.title = name;
                files.forEach(f => result.files.push(f));
                
                this._settings.log.endRun();
                
                return result;
            });
    }
}



interface IAzuRunContext {
    testFile(callback: AzuFileFunc): Promise<Results.IAzuFileResult>;
}

class AzuRunContext implements IAzuRunContext {

    constructor (settings: IAzuSettings, resources: Array<AzuResource>) {
        this._settings = settings;
        this._resources = resources;
    }

    private _settings: IAzuSettings;
    private _resources: Array<AzuResource>;

    testFile(callback: AzuFileFunc) : Promise<Results.IAzuFileResult> {

        let context = new AzuTestContext(this._settings, this._resources);
        let result = callback(context);

        return result;
    }
}

interface IAzuTestContext {
    getResults(): Array<Results.IAzuTestResult>;
    log: Log.IAzuLog;
    test(name: string, callback: Client.AzuTestFunc): void;
}

export class AzuTestContext implements IAzuTestContext {

    constructor (settings: IAzuSettings, resources: Array<AzuResource>) {
        this._results = new Array<Results.IAzuTestResult>();
        this._settings = settings;
        this._resources = resources;

        this.log = settings.log;
    }

    public log: Log.IAzuLog;
    private _results: Array<Results.IAzuTestResult>;
    private _settings: IAzuSettings;
    private _resources: Array<AzuResource>;

    /**
    * Performs a series of tests to verify the validity of resources.
    * @param name The name of the test.
    * @param callback A function responsible for running the tests.
    * @returns The subscription, allowing test chaining.
    */
    test(name: string, callback: Client.AzuTestFunc) {

        this._settings.log.startTest(name);

        let result = new Results.AzuTestResult();

        let test = new AzuTest(this._settings, name, result, this._resources);

        callback(test);

        this._results.push(result);

        this._settings.log.endTest();
    }

    getResults() {
        return this._results;
    }
}

class AzuTest implements Client.IAzuTest {

    constructor (settings: IAzuSettings, title: string, result: Results.IAzuTestResult, resources: Array<AzuResource>) {
        this._settings = settings;
        this.title = title;
        this._result = result;
        this._result.title = title;
        this._resources = resources;
    }

    public title: string = "";

    private _result: Results.IAzuTestResult;
    private _resources: Array<AzuResource>;
    private _settings: IAzuSettings;

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

class AzuResource implements Client.IAzuTestable {

    constructor(settings: IAzuSettings, resource: any) {
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

    private _settings: IAzuSettings;

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

class AzuResourceSet implements Client.IAzuTestable {

    constructor(settings: IAzuSettings, resources: Array<Client.IAzuTestable>) {
        this._resources = resources;
        this._settings = settings;
        this.shouldHaveInstanceCount = new AzuValue(settings, "", "Instance count", this._resources.length);
    }

    public shouldHaveInstanceCount : Client.IAzuValue;

    private _resources: Array<Client.IAzuTestable>;
    private _settings: IAzuSettings;

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

class AzuValue implements Client.IAzuValue {

    constructor(settings: IAzuSettings, resourceName: string, name: string, value: any) {
        this.resourceName = resourceName;
        this.name = name;
        this._actual = value;
        this._settings = settings;
    }

    public readonly resourceName: string = "";

    public readonly name: string = "";

    private _printName : string = "";
    private _actual : any = "";
    private _settings : IAzuSettings;


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

class AzuValueSet implements Client.IAzuValue {

    constructor(name: string, values: Array<Client.IAzuValue>, settings: IAzuSettings) {
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

interface IAzuSettings {
    log: Log.IAzuLog;
    authenticator: Abstractions.IAzureAuthenticator;
    resourceProvider: Abstractions.IAzureResourceProvider;
}

export class AzuSettings {
    constructor() {
        this.log = new Log.ConsoleLog(Globalization.Culture.enGb());
        this.authenticator = new Abstractions.AzureAuthenticator();
        this.resourceProvider = new Abstractions.AzureResourceProvider();
    }

    log: Log.IAzuLog;
    authenticator: Abstractions.IAzureAuthenticator;
    resourceProvider: Abstractions.IAzureResourceProvider;
}

export function createTestRunner(settings?: AzuSettings) {
    let s = settings || new AzuSettings();

    return new AzuApp(s); 
}
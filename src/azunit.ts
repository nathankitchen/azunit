import { IAzuRunEvaluator } from "./results/IAzuRunEvaluator";
import * as Abstractions from "./azure/abstractions";
import * as Globalization from "./i18n/locales";
import { MessageType } from "./i18n/messages";

var JsonPath = require("jsonpath");

type AzuRunFunc = (run: IAzuTestRun) => void;
type AzuSubFunc = (subscription: IAzuSubscription) => void;
type AzuTestFunc = (resources: IAzuTest) => void;

interface IAzuTestRunner {
    useServicePrincipal(tenant: string, principalId: string, secret: string, callback: AzuRunFunc) : Promise<IAzuRunResult>;
}

interface IAzuTestRun {
    name: string;
    description: string;
    getSubscription(id : string, callback: AzuSubFunc) : Promise<IAzuSubscriptionResult>;
}

interface IAzuSubscription {
    test(name: string, callback: AzuTestFunc) : IAzuSubscription;
    selectApproved() : IAzuTestable;
    selectUnapproved() : IAzuTestable;

}

interface IAzuTest {
    selectByProvider(provider: string) : IAzuTestable;
    selectByName(name: string) : IAzuTestable;
}

interface IAzuTestPack {

}

interface IAzuTestable {
    approve(message?: string): void;
    isApproved(): boolean;
    shouldHaveInstanceCount : IAzuValue;
    shouldHaveProperty(selector: string) : IAzuValue;
}

interface IAzuValue {
    disabled() : void;
    enabled() : void;
    equals(value: any) : void;
    as(name: string) : IAzuValue;
}

interface IAzuRunResult extends IAzuRunEvaluator {
    title: string;
    description: string;
    subscriptions: IAzuSubscriptionResult[];
}

interface IAzuSubscriptionResult extends IAzuRunEvaluator {
    id: string;
    name: string;
    tests: IAzuTestResult[];
}

interface IAzuTestResult extends IAzuRunEvaluator {
    title: string;
    assertions: IAzuAssertionResult[];
}

interface IAzuAssertionResult extends IAzuRunEvaluator {
    message: string;
}

class AzuTestRunner implements IAzuTestRunner {

    constructor(settings: IAzuSettings) {
        this._settings = settings;
    }

    private _settings: IAzuSettings;

    useServicePrincipal(tenant: string, clientId: string, secret: string, callback: AzuRunFunc) {

        return new Promise<IAzuRunResult>(

            (resolve, reject) => {

                let results = new AzuRunResult();

                //this._settings.log.write("Authenticating with tenant " + tenant + "...");

                this._settings.authenticator.getSPTokenCredentials(tenant, clientId, secret)
                .then((token) => {
                    let run = new AzuTestRun(this._settings, token);
                    callback(run);
                    resolve(run.result);
                })
                .catch((err) => { reject(err); });
            }
        );
    }
}

    class AzuTestRun implements IAzuTestRun {

        constructor(settings: IAzuSettings, token: Abstractions.IAzureToken) {
            this._settings = settings;
            this._token = token;
        }

        name: string = "";
        description: string = "";
        result: IAzuRunResult = new AzuRunResult();

        private _settings: IAzuSettings;
        private _token: Abstractions.IAzureToken;

        /**
        * Loads a subscription and allows tests to be run on its resources.
        * @param subscriptionId The ID of the subscription to load resources for.
        * @param callback The tests to run over the subscription.
        * @returns The test run, allowing test chaining.
        */
        getSubscription(subscriptionId: string, callback: AzuSubFunc) {

            return new Promise<IAzuSubscriptionResult>((resolve, reject) => {

                let subResult = new AzuSubcriptionResult();
            
                //this._settings.log.write(`Loading subscription ${subscriptionId}...`);

                this._settings.resourceProvider.list(subscriptionId, this._token)
                .then((data: Array<any>) => {
                    let resources = new Array<AzuResource>();
    
                    data.forEach(r => {
                        resources.push(new AzuResource(this._settings, r));            
                    });
                    
                    //this._settings.log.write(`Found ${data.length} resources to test`);

                    let sub = new AzuSubscription(this._settings, subResult, resources);
    
                    callback(sub);
                })
                .catch((err: Error) => { this._settings.log.error(err); });
    
                resolve(subResult);
            });
            
        };
    }

    class AzuSubscription implements IAzuSubscription {
        
        constructor (settings: IAzuSettings, result: IAzuSubscriptionResult, resources: Array<AzuResource>) {
            this._settings = settings;
            this._result = result;
            this._resources = resources;
        }

        private _result: IAzuSubscriptionResult;
        private _resources: Array<AzuResource>;
        private _settings: IAzuSettings;

        /**
        * Performs a series of tests to verify the validity of resources.
        * @param name The name of the test.
        * @param callback A function responsible for running the tests.
        * @returns The subscription, allowing test chaining.
        */
        test(name: string, callback: AzuTestFunc) {
            let testResult = new AzuTestResult();
            let test = new AzuTest(this._settings, name, testResult, this._resources);

            //this._settings.log.write("\t" + name);
            callback(test);

            this._result.tests.push(testResult);

            return this;
        }

        selectApproved() {
             return new AzuResourceSet(this._settings, this._resources.filter(r => r.isApproved()));
        }

        selectUnapproved() { 
            return new AzuResourceSet(this._settings, this._resources.filter(r => !r.isApproved()));
        }
    }

class AzuTest implements IAzuTest {

    constructor (settings: IAzuSettings, title: string, result: IAzuTestResult, resources: Array<AzuResource>) {
        this._settings = settings;
        this.title = title;
        this._result = result;
        this._result.title = title;
        this._resources = resources;
    }

    public title: string = "";

    private _result: IAzuTestResult;
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

class AzuResource implements IAzuTestable {

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

    public shouldHaveInstanceCount : IAzuValue

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

class AzuResourceSet implements IAzuTestable {

    constructor(settings: IAzuSettings, resources: Array<IAzuTestable>) {
        this._resources = resources;
        this._settings = settings;
        this.shouldHaveInstanceCount = new AzuValue(settings, "set", "instance count", this._resources.length);
    }

    public shouldHaveInstanceCount : IAzuValue;

    private _resources: Array<IAzuTestable>;
    private _settings: IAzuSettings;

    shouldHaveProperty(selector: string) {

        let valueSet = new Array<IAzuValue>();

        this._resources.forEach(r => {
            valueSet.push(r.shouldHaveProperty(selector));
        });

        return new AzuValueSet(selector, valueSet);
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

class AzuValue implements IAzuValue {

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

    disabled() { }
    
    enabled() {
        let message = (this._actual) ?
            Globalization.Resources.getAssertionEnabledSuccessMessage(this.getName(), this.resourceName, this._actual):
            Globalization.Resources.getAssertionEnabledFailureMessage(this.getName(), this.resourceName, this._actual);
    
        this._settings.log.write(message);
    }

    equals(expected : any) {
        let message = (expected == this._actual) ?
            Globalization.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
            Globalization.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);
        
        this._settings.log.write(message);
     }

     protected getName() {
        return (this._printName) ? this._printName : this.name;
    }
}

class AzuValueSet implements IAzuValue {

    constructor(name: string, value: Array<IAzuValue>) {
        this.name = name;
        this.actual = value;
    }

    public name: string = "";

    private actual : Array<IAzuValue>;

    as(name: string) {
        this.actual.forEach(v => {
            v.as(name);
        });

        return this;
    }

    disabled() { }
    enabled() { }
    equals(expected : any) {
        this.actual.forEach(v => {
            v.equals(expected);
        });
     }
}

    class AzuRunResult implements IAzuRunResult {
        title: string = "";
        description: string = "";
        subscriptions: IAzuSubscriptionResult[] = Array();
        
        isSuccess() {
            this.subscriptions.forEach(a => {
                if (!a) { return false; }
            });
            
            
            return true;
        }
    }

class AzuSubcriptionResult implements IAzuSubscriptionResult {
    id: string = "";
    name: string = "";
    tests: IAzuTestResult[] = new Array();
    isSuccess() {
        this.tests.forEach(a => {
            if (!a) { return false; }
        });
        
        return true;
    }
}

class AzuTestResult implements IAzuTestResult {
    title: string = "";
    assertions: IAzuAssertionResult[] = new Array();
    isSuccess() {

        this.assertions.forEach(a => {
            if (!a) { return false; }
        });

        return true;
    }
}

class AzuAssertionResult implements IAzuAssertionResult {
    
    message: string = "";
    
    private _success = true;
    
    isSuccess() {
        return this._success;
    }
}

interface IAzuSettings {
    log: IAzuLog;
    authenticator: Abstractions.IAzureAuthenticator;
    resourceProvider: Abstractions.IAzureResourceProvider;
}

class AzuSettings {

    constructor() {
        this.log = new RealtimeLog(Globalization.Culture.enGb());
        this.authenticator = new Abstractions.AzureAuthenticator();
        this.resourceProvider = new Abstractions.AzureResourceProvider();
    }

    log: IAzuLog;
    authenticator: Abstractions.IAzureAuthenticator;
    resourceProvider: Abstractions.IAzureResourceProvider;
}

interface IAzuLog {

    write(message: Globalization.IAzuCultureMessage): void;
    error(err: Error): void;
}

class RealtimeLog {
    constructor(locale: Globalization.IAzuLocale) {
        this._locale = locale;
    }

    private _locale: Globalization.IAzuLocale;

    write(message: Globalization.IAzuCultureMessage) {
        
        let iconFormatter = (i: string, t: MessageType) => {
            if (t == MessageType.Success) {
                return "\x1b[32m" + i + "\x1b[0m";
            }
            return i;
        };

        let tokenFormatter = (t: string) => {
                return "\x1b[1m" + t + "\x1b[0m";
        };

        console.log(message.toString(this._locale, iconFormatter, tokenFormatter));
    }

    error(err: Error) {
        console.log(err);
    }
}

class MemoryLog {
    constructor(locale: Globalization.IAzuLocale) {
        this._locale = locale;
    }

    private _locale: Globalization.IAzuLocale;

    write(message: Globalization.IAzuCultureMessage) {
        console.log(message.toString(this._locale));
    }

    error(err: Error) {
        console.log(err);
    }
}

export function createTestRunner(settings?: AzuSettings) {
    let s = settings || new AzuSettings();
    return new AzuTestRunner(s); 
}

import * as Abstractions from "./azure/abstractions";
import * as Globalization from "./i18n/locales";
import * as Log from "./io/log";
import * as Client from "./unit/client";
import * as Tests from "./unit/tests";

type AzuRunFunc = (context: IAzuRunContext) => Promise<IAzuSubscription>;
type AzuFileFunc = (subscription: IAzuTestContext) => Promise<IAzuTestContext>;

interface IAzuApp {
    useServicePrincipal(tenant: string, principalId: string, secret: string) : Promise<IAzuPrincipal>;
}

interface IAzuPrincipal {
    getSubscription(id : string) : Promise<IAzuSubscription>;
}

export interface IAzuSubscription {
    readonly subscriptionId: string;
    createTestRun(name: string, callback: AzuRunFunc): Promise<IAzuSubscription>;
}

interface IAzuTestRun {
    runTests(tests: Client.AzuTestFunc): Promise<IAzuTestRun>;
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
    getSubscription(subscriptionId: string): Promise<IAzuSubscription> {

        return new Promise<IAzuSubscription>((resolve, reject) => {
        
            this._settings.log.write(Globalization.Resources.statusSubscription(subscriptionId));

            this._settings.resourceProvider.list(subscriptionId, this._token)

            .then((data: Array<any>) => {
                let resources = new Array<Tests.AzuResource>();

                data.forEach(r => {
                    resources.push(new Tests.AzuResource(this._settings, r));            
                });
                
                let sub = new AzuSubscription(this._settings, subscriptionId, resources);

                resolve(sub);
            })
            .catch((err: Error) => { reject(err); });
        });
        
    };
}

class AzuSubscription implements IAzuSubscription {
    
    constructor (settings: IAzuSettings, subscriptionId: string, resources: Array<Tests.AzuResource>) {
        this._settings = settings;
        this._resources = resources;
        this.subscriptionId = subscriptionId;
    }

    private _resources: Array<Tests.AzuResource>;
    private _settings: IAzuSettings;

    public readonly subscriptionId: string;

    createTestRun(name: string, callback: AzuRunFunc) : Promise<IAzuSubscription> {

        this._settings.log.startRun(name, this.subscriptionId);

        let context = new AzuRunContext(this._settings, this._resources);

        return callback(context)
            .then((sub: IAzuSubscription) => {

                this._settings.log.endRun();
                
                return sub;
            });
    }
}



interface IAzuRunContext {
    testFile(callback: AzuFileFunc): Promise<IAzuTestContext>;
}

class AzuRunContext implements IAzuRunContext {

    constructor (settings: IAzuSettings, resources: Array<Tests.AzuResource>) {
        this._settings = settings;
        this._resources = resources;
    }

    private _settings: IAzuSettings;
    private _resources: Array<Tests.AzuResource>;

    testFile(callback: AzuFileFunc) : Promise<IAzuTestContext> {

        let context = new AzuTestContext(this._settings, this._resources);
        let result = callback(context);

        return result;
    }
}

export interface IAzuTestContext {
    log: Log.IAzuLog;
    test(name: string, callback: Client.AzuTestFunc): void;
}

export class AzuTestContext implements IAzuTestContext {

    constructor (settings: IAzuSettings, resources: Array<Tests.AzuResource>) {
        this._settings = settings;
        this._resources = resources;

        this.log = settings.log;
    }

    public log: Log.IAzuLog;
    private _settings: IAzuSettings;
    private _resources: Array<Tests.AzuResource>;

    /**
    * Performs a series of tests to verify the validity of resources.
    * @param name The name of the test.
    * @param callback A function responsible for running the tests.
    * @returns The subscription, allowing test chaining.
    */
    test(name: string, callback: Client.AzuTestFunc) {

        this._settings.log.startTest(name);

        let test = new Tests.AzuTest(this._settings, name, this._resources);

        callback(test);

        this._settings.log.endTest();
    }
}


export interface IAzuSettings {
    log: Log.IAzuLog;
    authenticator: Abstractions.IAzureAuthenticator;
    resourceProvider: Abstractions.IAzureResourceProvider;
}

export class AzuSettings implements IAzuSettings {
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
import * as Abstractions from "./azure/abstractions";
import * as Globalization from "./i18n/locales";
import * as Log from "./io/log";
import * as Client from "./unit/client";
import * as Tests from "./unit/tests";
import * as Package from "../package.json";
import { AzuState } from "./io/results";
import * as Writers from "./io/writers";
import vm from "vm";

type AzuFileLoaderFunc = (filename: string) => Promise<string>;

interface IAzuApp {
    useServicePrincipal(tenant: string, principalId: string, secret: string) : Promise<IAzuPrincipal>;
}

interface IAzuPrincipal {
    getSubscription(id : string) : Promise<IAzuSubscription>;
}

export interface IAzuSubscription {
    readonly subscriptionId: string;
    createTestRun(name: string, filenames: Array<string>, parameterFile: string, fileLoader: AzuFileLoaderFunc): Promise<boolean>;
}


class AzuApp implements IAzuApp {

    constructor(services: IAzuServices) {
        this._services = services;
        this._services.log.write(Globalization.Resources.title(Package.version));
    }

    private _services: IAzuServices;

    useServicePrincipal(tenant: string, clientId: string, secret: string) {

        return new Promise<IAzuPrincipal>(

            (resolve, reject) => {

                this._services.log.write(Globalization.Resources.statusTenant(tenant));

                this._services.authenticator.getSPTokenCredentials(tenant, clientId, secret)
                    .then((token) => {
                        let run = new AzuPrincipal(this._services, token);
                        resolve(run);
                    })
                    .catch((err) => { reject(err); });
            }
        );
    }
}

class AzuPrincipal implements IAzuPrincipal {

    constructor(services: IAzuServices, token: Abstractions.IAzureToken) {
        this._services = services;
        this._token = token;
    }

    private _services: IAzuServices;
    private _token: Abstractions.IAzureToken;

    /**
    * Loads a subscription and allows tests to be run on its resources.
    * @param subscriptionId The ID of the subscription to load resources for.
    * @param callback The tests to run over the subscription.
    * @returns The test run, allowing test chaining.
    */
    getSubscription(subscriptionId: string): Promise<IAzuSubscription> {

        return new Promise<IAzuSubscription>((resolve, reject) => {
        
            this._services.log.write(Globalization.Resources.statusSubscription(subscriptionId));

            this._services.resourceProvider
                .list(subscriptionId, this._token)
                .then((data: Array<any>) => {
                    let resources = new Array<Tests.AzuResource>();

                    data.forEach(r => {
                        resources.push(new Tests.AzuResource(this._services, r)); 
                    });
                    
                    let sub = new AzuSubscription(this._services, subscriptionId, resources);

                    resolve(sub);
                })
                .catch((err: Error) => { reject(err); });
        });
        
    };
}

class AzuSubscription implements IAzuSubscription {
    
    constructor (services: IAzuServices, subscriptionId: string, resources: Array<Tests.AzuResource>) {
        this._services = services;
        this._resources = resources;
        this.subscriptionId = subscriptionId;
    }

    private _resources: Array<Tests.AzuResource>;
    private _services: IAzuServices;

    public readonly subscriptionId: string;

    createTestRun(name: string, filenames: Array<string>, parameterFile: string, fileLoader: AzuFileLoaderFunc) : Promise<boolean> {

        this._services.log.startRun(name, this.subscriptionId);

        this._resources.forEach(resource => this._services.log.trackResource(resource.id, resource.name));
    
        let parameterLoader = new Promise<string>((resolve, reject) => { resolve(""); });

        // If there's a parameter file, attempt to load it.
        if (parameterFile) {
            parameterLoader = fileLoader(parameterFile)
                .then((jsonParamString: string) => {
                    try {
                        if (jsonParamString) {
                            return JSON.parse(jsonParamString);
                        }
                    }
                    catch {}
                    return null;
                });
        } 

        return parameterLoader.then((p: any) => {

            let fileTestPromises = new Array<Promise<void>>();

            filenames.forEach(filename => {
    
                var fileTest = fileLoader(filename).then((code) => {
    
                    let start = new Date();
                    let ctx = new AzuTestContext(this._services, this._resources);
    
                    let script = new vm.Script(code);
                    
                    let sandboxTitle = "Untitled";
                    let sandboxTests = new Array();
    
                    const item = {
                        title: function(title: string) {
                            sandboxTitle = title;
                        },
                        start: function(name: string, callback: Client.AzuTestFunc) {
                            sandboxTests.push({ name: name, callback: callback });
                        },
                        parameters: p
                    };
    
                    let env = vm.createContext(item);
    
                    script.runInContext(env);
    
                    this._services.log.startGroup(sandboxTitle, filename, start);
                    
                    sandboxTests.forEach(i => { ctx.test(i.name, i.callback); });
    
                    this._services.log.endGroup();
                });
    
                fileTestPromises.push(fileTest);
    
            });
    
            return Promise.all(fileTestPromises)
                .then(() => {
                    let success = true;
                    let results = this._services.log.endRun();
    
                    let totalTests = 0;
                    let totalFailures = 0;
                    let totalTime = 0;

                    results.forEach(result => {
                        if (result) {
                            success = (success && (result.getState() != AzuState.Failed));
                            this._services.resultsWriter.write(result);
                            totalTests += result.getTestCount();
                            totalFailures += result.getTestFailureCount();
                            totalTime += result.getDurationSeconds();
                        }
                    });
    
                    if (!success) {
                        this._services.log.write(Globalization.Resources.endRunFailed(totalTests, totalFailures, totalTime));
                    }
                    else {
                        this._services.log.write(Globalization.Resources.endRunPassed(totalTests, totalTime));
                    }
    
                    this._services.log.write(Globalization.Resources.completed());
    
                    return success;
                });
        });
    }
}

export interface IAzuTestContext {
    test(name: string, callback: Client.AzuTestFunc): void;
    ignore(name: string, reason: string, callback: Client.AzuTestFunc): void;
}

export class AzuTestContext implements IAzuTestContext {

    constructor (services: IAzuServices, resources: Array<Tests.AzuResource>) {
        this._services = services;
        this._resources = resources;
    }

    private _services: IAzuServices;
    private _resources: Array<Tests.AzuResource>;

    /**
    * Performs a series of tests to verify the validity of resources.
    * @param name The name of the test.
    * @param callback A function responsible for running the tests.
    * @returns The subscription, allowing test chaining.
    */
    test(name: string, callback: Client.AzuTestFunc) {

        this._services.log.startTest(name);

        let test = new Tests.AzuTest(this._services, name, this._resources);

        try {
            callback(test);
        }
        catch (e) {

        }
        
        this._services.log.endTest();
    }

    /**
    * Performs a series of tests to verify the validity of resources.
    * @param name The name of the test.
    * @param callback A function responsible for running the tests.
    * @returns The subscription, allowing test chaining.
    */
   ignore(name: string, reason: string, callback: Client.AzuTestFunc) {
        this._services.log.startTest(name);

        let test = new Tests.AzuTest(this._services, name, this._resources);

        callback(test);

        this._services.log.endTest();
    }
}



export interface IAzuServices {
    log: Log.IAzuLog;
    authenticator: Abstractions.IAzureAuthenticator;
    resourceProvider: Abstractions.IAzureResourceProvider;
    resultsWriter: Writers.IAzuResultsWriter;
}

export class AzuServices implements IAzuServices {
    constructor() {
        this.log = new Log.ConsoleLog(Globalization.Culture.enGb());
        this.authenticator = new Abstractions.AzureAuthenticator();
        this.resourceProvider = new Abstractions.AzureResourceProvider();
        this.resultsWriter = new Writers.HtmlAzuResultsWriter("output/x.html");
    }

    log: Log.IAzuLog;
    resultsWriter: Writers.IAzuResultsWriter;
    authenticator: Abstractions.IAzureAuthenticator;
    resourceProvider: Abstractions.IAzureResourceProvider;
}

export class AzuRunSettings {

    public culture: string = "enGb";
    public silentMode: boolean = false;
    public outputXmlPath: string = "";
    public outputJsonPath: string = "";
    public outputHtmlPath: string = "";
    public outputMarkdownPath: string = "";
    public outputCsvPath: string = "";
}

export function createTestRunner(settings: AzuRunSettings) {

    let culture = Globalization.Culture.enGb();

    let logs = new Array<Log.IAzuLog>();
    let resultsWriters = new Array<Writers.IAzuResultsWriter>();

    logs.push(new Log.ResultsLog(culture));
    if (!settings.silentMode) { logs.push(new Log.ConsoleLog(culture)); }

    if (settings.outputXmlPath) { resultsWriters.push(new Writers.XmlAzuResultsWriter(settings.outputXmlPath)); }
    if (settings.outputJsonPath) { resultsWriters.push(new Writers.JsonAzuResultsWriter(settings.outputJsonPath)); }
    if (settings.outputHtmlPath) { resultsWriters.push(new Writers.HtmlAzuResultsWriter(settings.outputHtmlPath)); }
    if (settings.outputMarkdownPath) { resultsWriters.push(new Writers.MarkdownAzuResultsWriter(settings.outputMarkdownPath)); }
    if (settings.outputCsvPath) { resultsWriters.push(new Writers.CsvAzuResultsWriter(settings.outputCsvPath)); }

    let services = new AzuServices();

    services.log = new Log.MultiLog(logs);
    services.resultsWriter = new Writers.MultiAzuResultsWriter(resultsWriters);

    return new AzuApp(services); 
}
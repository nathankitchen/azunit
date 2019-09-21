import * as Client from "../azunit-client";
import * as I18n from "../azunit-i18n";
import * as Services from "../azunit-services";

import { IAzuSubscription } from "./IAzuSubscription";
import { AzuFileLoaderFunc } from "./AzuFileLoaderFunc";

import { AzuState } from "../azunit";

import * as VM from "vm";

export class AzuSubscription implements IAzuSubscription {
    
    constructor (services: Services.IAzuServices, subscriptionId: string, resources: Array<Client.IAzuTestable>) {
        this._services = services;
        this._resources = resources;
        this.subscriptionId = subscriptionId;
    }

    private _resources: Array<Client.IAzuTestable>;
    private _services: Services.IAzuServices;

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
                    let ctx = new Client.AzuTestContext(this._services, this._resources);
    
                    let script = new VM.Script(code);
                    
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
    
                    let env = VM.createContext(item);
    
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

                    if (results) {
                        results.forEach(result => {
                            if (result) {
                                success = (success && (result.getState() != AzuState.Failed));
                                this._services.resultsWriter.write(result);
                                totalTests += result.getTestCount();
                                totalFailures += result.getTestFailureCount();
                                totalTime += result.getDurationSeconds();
                            }
                        });
                    }
    
                    if (!success) {
                        this._services.log.write(I18n.Resources.endRunFailed(totalTests, totalFailures, totalTime));
                    }
                    else {
                        this._services.log.write(I18n.Resources.endRunPassed(totalTests, totalTime));
                    }
    
                    this._services.log.write(I18n.Resources.completed());
    
                    return success;
                });
        });
    }
}
import * as Client from "../azunit-client";
import * as Logging from "../azunit-results-logging";

import { IAzuSubscription } from "./IAzuSubscription";
import { AzuFileLoaderFunc } from "./AzuFileLoaderFunc";
import { AzuTestContext } from "../azunit/AzuTestContext";
import { IAzuRunResult } from "../azunit-results";

import * as VM from "vm";

export class AzuSubscription implements IAzuSubscription {
    
    constructor (log: Logging.IAzuLog, subscriptionId: string, resources: Array<Client.IAzuResource>) {
        this._log = log;
        this._resources = resources;
        this.subscriptionId = subscriptionId;
    }

    private _resources: Array<Client.IAzuResource>;
    private _log: Logging.IAzuLog;

    public readonly subscriptionId: string;

    createTestRun(name: string, filenames: Array<string>, parameterFile: string, fileLoader: AzuFileLoaderFunc) : Promise<Array<IAzuRunResult>> {

        this._log.startRun(name, this.subscriptionId);

        this._resources.forEach(resource => this._log.trackResource(resource.id, resource.name));
    
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
    
                    this._log.startGroup(sandboxTitle, filename, start);
                    
                    sandboxTests.forEach(i => {
                        this._log.startTest(i.name);

                        let test = new AzuTestContext(this._log, i.name, this._resources);
                
                        try {
                            i.callback(test);
                        }
                        catch (e) {
                
                        }
                        
                        this._log.endTest();
                    });
    
                    this._log.endGroup();
                });
    
                fileTestPromises.push(fileTest);
    
            });
    
            return Promise.all(fileTestPromises)
                .then(() => {
                    return this._log.endRun();
                });
        });
    }
}
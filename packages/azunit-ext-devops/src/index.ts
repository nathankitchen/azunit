import * as App from "azunit-lib";
import * as Task from "azure-pipelines-task-lib/task";
import * as Package from "../package.json";
import glob from "glob";
import path from "path";

async function run() {
    try {
        const inputPath: string | undefined = Task.getInput('config', false);
        
        let configPath = path.join(__dirname, inputPath || "azunit.yml");

        if (configPath == undefined) {
            Task.setResult(Task.TaskResult.Failed, 'No path to YML configuration was provided');
            return;
        }
        console.log('Hello', configPath);

        const config = App.AzuSettings.loadYaml(configPath);

        let app = App.createApp(config, Package.version);
        
        let exceptionHandler = (err: Error) => {
            app.logError(err);
            process.exitCode = 1;
        };
        
        glob(config.run.select, function (er, files) {
        
            app.useServicePrincipal(config.auth.tenant, config.auth.appId, config.auth.appKey)
                .then((principal) => {
        
                    principal.getSubscription(config.auth.subscription)
                        .then((subscription) => {
        
                            subscription.createTestRun(config.run.name, files, config.run.parameters, App.FileLoaderFunc)
                                .then((results) => {
                                    let success = app.logResults(results, config.output);
                                    if (!success) {
                                        Task.setResult(Task.TaskResult.SucceededWithIssues, 'Completed AzUnit test run with failures');
                                    }
                                    else {
                                        Task.setResult(Task.TaskResult.Succeeded, 'Completed AzUnit test with success');
                                    }
                                })
                                .catch(exceptionHandler);
                        })
                        .catch(exceptionHandler);
                })
                .catch(exceptionHandler);
            });


    }
    catch (err) {
        Task.setResult(Task.TaskResult.Failed, err.message);
    }
}

run();
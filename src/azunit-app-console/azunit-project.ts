import * as App from "../azunit-app";
import * as Package from "../../package.json";

import program from "commander";
import fs from "fs";
import glob from "glob";

program
    .option("-c, --config <config>", "The configuration file to target")
    .parse(process.argv);

const config = App.AzuSettings.loadYaml(program.config);

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

                    let fileLoader = (filename: string) => {
                        return new Promise<string>((resolve, reject) => {
                            if (filename) {
                                fs.readFile(filename, "utf8", function (err, data) {
                                    if (err) { reject(err); }
                                    resolve(data);
                                });
                            }
                            else {
                                resolve("");
                            }
                        });
                    };

                    subscription.createTestRun(config.run.name, files, config.run.parameters, fileLoader)
                        .then((results) => {
                            let success = app.logResults(results, config.output);
                            process.exitCode = (success) ? 0 : 1;
                        })
                        .catch(exceptionHandler);
                })
                .catch(exceptionHandler);
        })
        .catch(exceptionHandler);

    });
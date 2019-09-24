import * as App from "../azunit-app";
import * as Package from "../../package.json";

import fs from "fs";
import program from "commander";
import YAML from "yaml";

program
    .option('-c, --config <configFile>', 'The domain of the tenant')
    .option('-t, --tags [tags]', 'ID of the application service principal with access to target subscription')
    .parse(process.argv);

let settings = new App.AzuAppSettings();
let auth = new App.AzuAuthSettings();

let app = App.createApp(settings, Package.version);

let exceptionHandler = (err: Error) => {
    app.logError(err);
    process.exitCode = 1;
};

fs.readFile(program.configFile, "utf8", function (err, data) {
    let config = YAML.parse(data);

    if (config) {
        if (config.auth) {
            if (config.auth.tenant) {
                if (config.auth.tenant.length > 1 && config.auth.tenant[0] == "$") {
                    
                    let tenantKey = config.auth.tenant.substring(1);

                    if (tenantKey) {
                        let tenant = process.env[tenantKey];

                        if (tenant) {
                            auth.tenant = tenant;
                        }
                        else {
                            throw new Error("Could not find environment variable named " + tenantKey);
                        }
                    }
                }
                else {
                    auth.tenant = config.auth.tenant;
                }
            }
        }
    }

    app.useServicePrincipal(auth.tenant, auth.appId, auth.appKey)
        .then((principal) => {

            principal.getSubscription(auth.subscription)
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
                })
                .catch(exceptionHandler);
        })
        .catch(exceptionHandler);
});
import * as App from "../azunit-app";
import * as Package from "../../package.json";

import program from "commander";

program
    .option("-c, --config <config>", "The configuration file to target")
    .option("-o, --output <filename>", "Target dump filename")
    .parse(process.argv);

const config = App.AzuSettings.loadYaml(program.config);

let app = App.createApp(config, Package.version);

let exceptionHandler = (err: Error) => {
    app.logError(err);
    process.exitCode = 1;
};

app.useServicePrincipal(config.auth.tenant, config.auth.appId, config.auth.appKey)
    .then((principal) => {

        principal.getSubscription(config.auth.subscription)
            .then((subscription) => {
                subscription.dump(program.output);
            })
            .catch(exceptionHandler);
    })
    .catch(exceptionHandler);
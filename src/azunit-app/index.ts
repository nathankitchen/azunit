import * as Globalization from "../azunit-globalization";
import * as Logging from "../azunit-results-logging";
import * as Writers from "../azunit-results-writers";
import * as Azure from "../azunit-azure";

import { IAzuApp } from "./IAzuApp";
import { IAzuPrincipal } from "./IAzuPrincipal";
import { IAzuSubscription } from "./IAzuSubscription";
import { AzuOutputSettings } from "./AzuOutputSettings";
import { AzuAuthSettings } from "./AzuAuthSettings";
import { AzuApp } from "./AzuApp";
import { AzuSettings } from "./AzuSettings";

export { 
    IAzuApp,
    IAzuPrincipal,
    IAzuSubscription,
    AzuSettings,
    AzuOutputSettings,
    AzuAuthSettings
};

export function createApp(settings: AzuSettings, version: string) {

    let culture = Globalization.Culture.enGb();

    let logs = new Array<Logging.IAzuLog>();

    logs.push(new Logging.ResultsLog(culture));
    
    if (!settings.run.silent) { logs.push(new Logging.ConsoleLog(culture, (text: string) => { console.log(text); })); }

    let log = new Logging.MultiLog(logs);
    let authenticator = new Azure.AzureAuthenticator();
    let resourceProvider = new Azure.AzureResourceProvider();

    return new AzuApp(version, log, authenticator, resourceProvider);
}
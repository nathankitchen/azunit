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

export function createApp(settings: AzuOutputSettings, version: string) {

    let culture = Globalization.Culture.enGb();

    let logs = new Array<Logging.IAzuLog>();
    let resultsWriters = new Array<Writers.IAzuResultsWriter>();

    logs.push(new Logging.ResultsLog(culture));
    
    if (!settings.silentMode) { logs.push(new Logging.ConsoleLog(culture, (text: string) => { console.log(text); })); }

    if (settings.outputXmlPath) { resultsWriters.push(new Writers.XmlAzuResultsWriter(settings.outputXmlPath)); }
    if (settings.outputJsonPath) { resultsWriters.push(new Writers.JsonAzuResultsWriter(settings.outputJsonPath)); }

    let log = new Logging.MultiLog(logs);
    let writer = new Writers.MultiAzuResultsWriter(resultsWriters);
    let authenticator = new Azure.AzureAuthenticator();
    let resourceProvider = new Azure.AzureResourceProvider();

    return new AzuApp(version, log, writer, authenticator, resourceProvider);
}
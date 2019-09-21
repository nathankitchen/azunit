import * as Globalization from "../azunit-globalization";
import * as Logging from "../azunit-results-logging";
import * as Writers from "../azunit-results-writers";
import * as Services from "../azunit-services";

import { IAzuApp } from "./IAzuApp";
import { IAzuPrincipal } from "./IAzuPrincipal";
import { IAzuSubscription } from "./IAzuSubscription";
import { AzuRunSettings } from "./AzuRunSettings";
import { AzuApp } from "./AzuApp";

export { 
    IAzuApp,
    IAzuPrincipal,
    IAzuSubscription,
    AzuRunSettings
};

export function createApp(settings: AzuRunSettings, version: string) {

    let culture = Globalization.Culture.enGb();

    let logs = new Array<Logging.IAzuLog>();
    let resultsWriters = new Array<Writers.IAzuResultsWriter>();

    logs.push(new Logging.ResultsLog(culture));
    if (!settings.silentMode) { logs.push(new Logging.ConsoleLog(culture, (text: string) => { console.log(text); })); }

    if (settings.outputXmlPath) { resultsWriters.push(new Writers.XmlAzuResultsWriter(settings.outputXmlPath)); }
    if (settings.outputJsonPath) { resultsWriters.push(new Writers.JsonAzuResultsWriter(settings.outputJsonPath)); }
    if (settings.outputHtmlPath) { resultsWriters.push(new Writers.HtmlAzuResultsWriter(settings.outputHtmlPath)); }
    if (settings.outputMarkdownPath) { resultsWriters.push(new Writers.MarkdownAzuResultsWriter(settings.outputMarkdownPath)); }
    if (settings.outputCsvPath) { resultsWriters.push(new Writers.CsvAzuResultsWriter(settings.outputCsvPath)); }

    let services = new Services.AzuServices();

    services.log = new Logging.MultiLog(logs);
    services.resultsWriter = new Writers.MultiAzuResultsWriter(resultsWriters);

    return new AzuApp(services, version); 
}
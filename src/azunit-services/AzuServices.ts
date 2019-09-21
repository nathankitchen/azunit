import * as Globalization from "../azunit-globalization";
import * as Azure from "../azunit-azure";
import * as Logging from "../azunit-results-logging";
import * as Writers from "../azunit-results-writers";

import { IAzuServices } from "./IAzuServices";

export class AzuServices implements IAzuServices {
    constructor() {
        this.log = new Logging.ConsoleLog(Globalization.Culture.enGb(), (text: string) => { console.log(text); });
        this.authenticator = new Azure.AzureAuthenticator();
        this.resourceProvider = new Azure.AzureResourceProvider();
        this.resultsWriter = new Writers.HtmlAzuResultsWriter("output/x.html");
    }

    public readonly log: Logging.IAzuLog;
    public readonly resultsWriter: Writers.IAzuResultsWriter;
    public readonly authenticator: Azure.IAzureAuthenticator;
    public readonly resourceProvider: Azure.IAzureResourceProvider;
}
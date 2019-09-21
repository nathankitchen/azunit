import * as Logging from "../azunit-results-logging";
import * as Azure from "../azunit-azure";
import * as Writers from "../azunit-results-writers";

export interface IAzuServices {
    log: Logging.IAzuLog;
    authenticator: Azure.IAzureAuthenticator;
    resourceProvider: Azure.IAzureResourceProvider;
    resultsWriter: Writers.IAzuResultsWriter;
}
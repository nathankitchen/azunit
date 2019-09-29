import * as Core from "../azunit";
import * as Azure from "../azunit-azure";
import * as I18n from "../azunit-i18n";
import * as Logging from "../azunit-results-logging";

import { IAzuPrincipal } from "./IAzuPrincipal";
import { IAzuSubscription } from "./IAzuSubscription";
import { AzuSubscription } from "./AzuSubscription";

export class AzuPrincipal implements IAzuPrincipal {

    constructor(token: Azure.IAzureToken, log: Logging.IAzuLog, resourceProvider: Azure.IAzureResourceProvider) {
        this._token = token;
        this._log = log;
        this._resourceProvider = resourceProvider;
    }

    private _token: any;
    private _log: Logging.IAzuLog;
    private _resourceProvider: Azure.IAzureResourceProvider;
    
    /**
    * Loads a subscription and allows tests to be run on its resources.
    * @param subscriptionId The ID of the subscription to load resources for.
    * @param callback The tests to run over the subscription.
    * @returns The test run, allowing test chaining.
    */
    getSubscription(subscriptionId: string): Promise<IAzuSubscription> {

        return new Promise<IAzuSubscription>((resolve, reject) => {
        
            this._log.write(I18n.Resources.statusSubscription(subscriptionId));

            this._resourceProvider
                .list(subscriptionId, this._token)
                .then((data: Array<any>) => {
                    let resources = new Array<Core.IAzuAppResource>();

                    data.forEach(r => {
                        resources.push(new Core.AzuResource(this._log, r)); 
                    });
                    
                    let sub = new AzuSubscription(this._log, subscriptionId, resources);

                    resolve(sub);
                })
                .catch((err: Error) => { reject(err); });
        });
    };
}
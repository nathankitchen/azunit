import * as Azure from "../azunit-azure";
import * as I18n from "../azunit-i18n";
import * as Client from "../azunit-client";
import * as Services from "../azunit-services";

import { IAzuPrincipal } from "./IAzuPrincipal";
import { IAzuSubscription } from "./IAzuSubscription";

import { AzuSubscription } from "./AzuSubscription";

export class AzuPrincipal implements IAzuPrincipal {

    constructor(services: Services.IAzuServices, token: Azure.IAzureToken) {
        this._services = services;
        this._token = token;
    }

    private _services: Services.IAzuServices;
    private _token: Azure.IAzureToken;

    /**
    * Loads a subscription and allows tests to be run on its resources.
    * @param subscriptionId The ID of the subscription to load resources for.
    * @param callback The tests to run over the subscription.
    * @returns The test run, allowing test chaining.
    */
    getSubscription(subscriptionId: string): Promise<IAzuSubscription> {

        return new Promise<IAzuSubscription>((resolve, reject) => {
        
            this._services.log.write(I18n.Resources.statusSubscription(subscriptionId));

            this._services.resourceProvider
                .list(subscriptionId, this._token)
                .then((data: Array<any>) => {
                    let resources = new Array<Client.IAzuTestable>();

                    data.forEach(r => {
                        resources.push(new Client.AzuResource(this._services, r)); 
                    });
                    
                    let sub = new AzuSubscription(this._services, subscriptionId, resources);

                    resolve(sub);
                })
                .catch((err: Error) => { reject(err); });
        });
        
    };
}
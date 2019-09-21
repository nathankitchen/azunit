import * as I18n from "../azunit-i18n";
import * as Services from "../azunit-services";

import { IAzuApp } from "./IAzuApp";
import { IAzuPrincipal } from "./IAzuPrincipal";
import { AzuPrincipal } from "./AzuPrincipal";

export class AzuApp implements IAzuApp {

    constructor(services: Services.IAzuServices, version: string) {
        this._services = services;
        this._services.log.write(I18n.Resources.title(version));
        this.version = version;
    }

    public readonly version: string;
    private _services: Services.IAzuServices;

    useServicePrincipal(tenant: string, clientId: string, secret: string) {

        return new Promise<IAzuPrincipal>(

            (resolve, reject) => {

                this._services.log.write(I18n.Resources.statusTenant(tenant));

                this._services.authenticator.getSPTokenCredentials(tenant, clientId, secret)
                    .then((token) => {
                        let run = new AzuPrincipal(this._services, token);
                        resolve(run);
                    })
                    .catch((err) => { reject(err); });
            }
        );
    }
}
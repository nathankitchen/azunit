import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import { IAzureAuthenticator } from "./IAzureAuthenticator";
import { IAzureToken } from "./IAzureToken";
import { AzureToken } from "./AzureToken";

export class AzureAuthenticator implements IAzureAuthenticator {

    getSPTokenCredentials(tenant: string, clientId: string, secret: string)
    {
        return new Promise<IAzureToken>(
            (resolve, reject) => {

                msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(clientId, secret, tenant)
                    .then((response) => {
                        let token = new AzureToken(response.credentials);
                        resolve(token);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            );
    }
}
import Azure from "ms-rest-azure";
import { IAzureAuthenticator } from "./IAzureAuthenticator";
import { IAzureToken } from "./IAzureToken";
import { AzureToken } from "./AzureToken";

export class AzureAuthenticator implements IAzureAuthenticator {

    getSPTokenCredentials(tenant: string, clientId: string, secret: string)
    {
        return new Promise<IAzureToken>(
            (resolve, reject) => {

                Azure.loginWithServicePrincipalSecret(clientId, secret, tenant, function(err: Error, credentials: Azure.ApplicationTokenCredentials) {
                    
                    if (err) reject(err);
        
                    let token = new AzureToken(credentials);
        
                    resolve(token);
                });
            });
    }
}
import { IAzureAuthenticator } from "./IAzureAuthenticator";
import { IAzureToken } from "./IAzureToken";
import { AzureToken } from "./AzureToken";
import { TestTokenCredentials } from "./TestTokenCredentials";

export class TestAuthenticator implements IAzureAuthenticator {

    getSPTokenCredentials(tenant: string, clientId: string, secret: string)
    {
        return new Promise<IAzureToken>(
            (resolve, reject) => {
                resolve(new AzureToken(new TestTokenCredentials()));
            });
    }
}

import { IAzureToken } from "./IAzureToken";
import { IAzuResource } from "../azunit-client";

/** An abstraction to encapsulate the retrieval of resources from Azure, enabling test scenarios. */
export interface IAzureResourceProvider {
    /**
     * Lists the resources in the specified subscription.
     * @param subscriptionId The subscription to retrieve resources for.
     * @param token An authentication token with required privileges to read resources.
     */
    list(subscriptionId: string, token: IAzureToken) : Promise<Array<IAzuResource>>;
}
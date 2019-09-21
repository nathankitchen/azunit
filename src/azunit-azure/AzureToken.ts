import Azure from "ms-rest-azure";
import { IAzureToken } from "./IAzureToken";
import { TestTokenCredentials } from "./TestTokenCredentials";

/** A class to contain an authentication token across a range of authentication mechanisms. */
export class AzureToken implements IAzureToken {

    constructor(value: Azure.DeviceTokenCredentials | Azure.ApplicationTokenCredentials | Azure.UserTokenCredentials | TestTokenCredentials)
    {
        this.value = value;
    }

    readonly value: Azure.DeviceTokenCredentials | Azure.ApplicationTokenCredentials | Azure.UserTokenCredentials | TestTokenCredentials;
}
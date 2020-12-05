import * as Azure from "@azure/ms-rest-nodeauth";
import { IAzureToken } from "./IAzureToken";

/** A class to contain an authentication token across a range of authentication mechanisms. */
export class AzureToken implements IAzureToken {

    constructor(value: Azure.TokenCredentialsBase)
    {
        this.value = value;
    }

    readonly value: Azure.TokenCredentialsBase;
}
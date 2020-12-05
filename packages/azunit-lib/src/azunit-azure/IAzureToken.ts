import * as Azure from "@azure/ms-rest-nodeauth";

/** An abstraction for the handling of auth tokens, enabling code reuse across a range of testing and authentication scenarios. */
export interface IAzureToken {
    value: Azure.TokenCredentialsBase;
}
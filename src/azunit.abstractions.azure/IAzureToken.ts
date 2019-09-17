import Azure from "ms-rest-azure";
import { TestTokenCredentials } from "./TestTokenCredentials";

/** An abstraction for the handling of auth tokens, enabling code reuse across a range of testing and authentication scenarios. */
export interface IAzureToken {
    value: Azure.DeviceTokenCredentials | Azure.ApplicationTokenCredentials | Azure.UserTokenCredentials | TestTokenCredentials;
}
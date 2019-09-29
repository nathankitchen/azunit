import { IAzuPrincipal } from "./IAzuPrincipal";
import { AzuOutputSettings } from "./AzuOutputSettings";

import { IAzuRunResult } from "../azunit-results";

export interface IAzuApp {
    useServicePrincipal(tenant: string, principalId: string, secret: string) : Promise<IAzuPrincipal>;
    logResults(results: Array<IAzuRunResult>, settings: AzuOutputSettings): number;
    logError(err: Error): void;
}
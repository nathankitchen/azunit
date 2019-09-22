import { IAzuPrincipal } from "./IAzuPrincipal";
import { IAzuRunResult } from "../azunit-results";

export interface IAzuApp {
    useServicePrincipal(tenant: string, principalId: string, secret: string) : Promise<IAzuPrincipal>;
    logResults(results: Array<IAzuRunResult>): number;
    logError(err: Error): void;
}
import { IAzuPrincipal } from "./IAzuPrincipal";

export interface IAzuApp {
    useServicePrincipal(tenant: string, principalId: string, secret: string) : Promise<IAzuPrincipal>;
}
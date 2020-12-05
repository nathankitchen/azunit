import { IAzuSubscription } from "./IAzuSubscription";

export interface IAzuPrincipal {
    getSubscription(id : string) : Promise<IAzuSubscription>;
}
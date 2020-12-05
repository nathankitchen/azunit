import { IAzuTestable } from "./IAzuTestable";

export interface IAzuResource extends IAzuTestable {
    readonly id: string;
    readonly name: string;
    readonly resourceGroup: string;
    readonly provider: string;
}
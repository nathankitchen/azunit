import * as Client from "../azunit-client";

export interface IAzuAppResource extends Client.IAzuResource {
    getData(): Array<any>;
}
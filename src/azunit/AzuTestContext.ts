import * as Logging from "../azunit-results-logging";

import { IAzuTestContext } from "../azunit-client/IAzuTestContext";
import { IAzuTestable } from "../azunit-client/IAzuTestable";
import { IAzuClientLog } from "../azunit-client/IAzuClientLog";
import { AzuClientLog } from "../azunit-client/AzuClientLog";
import { IAzuResource } from "../azunit-client/IAzuResource";
import { AzuResourceSet } from "./AzuResourceSet";

export class AzuTestContext implements IAzuTestContext {

    constructor (log: Logging.IAzuLog, title: string, resources: Array<IAzuResource>) {
        this._log = log;
        this._resources = resources;

        this.log = new AzuClientLog(this._log);
    }

    public title: string = "";
    public description: string = "";
    public ignore: boolean = false;
    public readonly categories: Array<string> = new Array<string>();

    public readonly log: IAzuClientLog;

    private _resources: Array<IAzuResource>;
    private _log: Logging.IAzuLog;

    selectResourcesByProvider(provider: string) : IAzuTestable {
        return new AzuResourceSet(this._log, this._resources.filter(r => r.provider.toLowerCase() === provider.toLocaleLowerCase()));
    }
    
    selectResourcesByName(name: string) : IAzuTestable  {
        return new AzuResourceSet(this._log, this._resources.filter(r => r.name.toLowerCase() === name.toLowerCase()));
    }
}
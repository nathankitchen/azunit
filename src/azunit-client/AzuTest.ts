import * as Logging from "../azunit.results.logging";

import { IAzuTest } from "./IAzuTest";
import { IAzuTestable } from "./IAzuTestable";
import { IAzuClientLog } from "./IAzuClientLog";
import { AzuClientLog } from "./AzuClientLog";
import { AzuResource } from "./AzuResource";
import { AzuResourceSet } from "./AzuResourceSet";

export class AzuTest implements IAzuTest {

    constructor (log: Logging.IAzuLog, title: string, resources: Array<AzuResource>) {
        this._log = log;
        this._resources = resources;

        this.log = new AzuClientLog(this._log);
    }

    public title: string = "";
    public description: string = "";
    public ignore: boolean = false;
    public readonly categories: Array<string> = new Array<string>();

    public readonly log: IAzuClientLog;

    private _resources: Array<AzuResource>;
    private _log: Logging.IAzuLog;

    selectResourcesByProvider(provider: string) : IAzuTestable {
        return new AzuResourceSet(this._log, this._resources.filter(r => r.provider.toLowerCase() === provider.toLocaleLowerCase()));
    }
    
    selectResourcesByName(name: string) : IAzuTestable  {
        return new AzuResourceSet(this._log, this._resources.filter(r => r.name.toLowerCase() === name.toLowerCase()));
    }
}
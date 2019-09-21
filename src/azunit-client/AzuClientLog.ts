import { IAzuLog } from "../azunit.results.logging";
import { IAzuClientLog } from "./IAzuClientLog";
import * as Globalization from "../azunit.globalization.messages";

export class AzuClientLog implements IAzuClientLog {

    constructor(log: IAzuLog) {
        this._log = log;
    }

    private _log: IAzuLog;

    trace(message: string) : void {
        this._log.write(Globalization.Resources.clientTrace(message));
    }

    write(message: string) : void {
        this._log.write(Globalization.Resources.clientText(message));
    }

    warning(message: string) : void {
        this._log.write(Globalization.Resources.clientWarning(message));
    }

    error(message: string) : void {
        this._log.write(Globalization.Resources.clientError(message));
    }
}
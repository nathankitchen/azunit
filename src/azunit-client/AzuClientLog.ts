import { IAzuLog } from "../azunit-results-logging";
import { IAzuClientLog } from "./IAzuClientLog";
import * as I18n from "../azunit-i18n";

export class AzuClientLog implements IAzuClientLog {

    constructor(log: IAzuLog) {
        this._log = log;
    }

    private _log: IAzuLog;

    trace(message: string) : void {
        this._log.write(I18n.Resources.clientTrace(message));
    }

    write(message: string) : void {
        this._log.write(I18n.Resources.clientText(message));
    }

    warning(message: string) : void {
        this._log.write(I18n.Resources.clientWarning(message));
    }

    error(message: string) : void {
        this._log.write(I18n.Resources.clientError(message));
    }
}
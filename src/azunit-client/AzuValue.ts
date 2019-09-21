import * as I18n from "../azunit-i18n";
import * as Logging from "../azunit-results-logging";

import { IAzuValue } from "./IAzuValue";

export class AzuValue implements IAzuValue {

    constructor(log: Logging.IAzuLog, resourceId: string, resourceName: string, name: string, value: any) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.name = name;
        this._actual = value;
        this._log = log;
    }

    public readonly resourceId: string = "";
    public readonly resourceName: string = "";
    public readonly name: string = "";

    private _log : Logging.IAzuLog;
    private _printName : string = "";
    private _actual : any = "";

    as(name: string) {
        this._printName = name;
        return this;
    }

    disabled() {
        let message = (this._actual === false) ?

        I18n.Resources.getAssertionDisabledSuccessMessage(this.getName(), this.resourceName, this._actual):
        I18n.Resources.getAssertionDisabledFailureMessage(this.getName(), this.resourceName, this._actual);

        this._log.assert(message, this.resourceId, this.resourceName, false, this._actual);
     }
    
    enabled() {
        let message = (this._actual) ?
        I18n.Resources.getAssertionEnabledSuccessMessage(this.getName(), this.resourceName, this._actual):
        I18n.Resources.getAssertionEnabledFailureMessage(this.getName(), this.resourceName, this._actual);

        this._log.assert(message, this.resourceId, this.resourceName, true, this._actual);
    }

    equals(expected : string | number | boolean) {
        let message = (expected == this._actual) ?
        I18n.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
        I18n.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     arrayContains(expected : string | number) {
        let message = (expected == this._actual) ?
        I18n.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
        I18n.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     greaterThan(expected : number) {
        let message = (expected == this._actual) ?
        I18n.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
        I18n.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     greaterThanOrEqual(expected : number) {
        let message = (expected == this._actual) ?
        I18n.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
        I18n.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     lessThan(expected : string | number) {
        let message = (expected == this._actual) ?
        I18n.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
        I18n.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     lessThanOrEqual(expected : string | number) {
        let message = (expected == this._actual) ?
        I18n.Resources.getAssertionEqualsSuccessMessage(this.getName(), this.resourceName, expected, this._actual) :
        I18n.Resources.getAssertionEqualsFailureMessage(this.getName(), this.resourceName, expected, this._actual);

        this._log.assert(message, this.resourceId, this.resourceName, expected, this._actual);
     }

     protected getName() {
        return (this._printName) ? this._printName : this.name;
    }
}

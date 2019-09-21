import * as Logs from "../azunit.results.logging";

import { IAzuValue } from "./IAzuValue";
import { AzuValue } from "./AzuValue";

export class AzuValueSet implements IAzuValue {

    constructor(name: string, values: Array<IAzuValue>, log: Logs.IAzuLog) {
        this.name = name;
        this._actual = values;

        if (!this._actual.length) {
            this._actual.push(new AzuValue(log, "", "", this.name, 0));
        }
    }

    public name: string = "";

    private _actual : Array<IAzuValue>;

    as(name: string) {
        this._actual.forEach(v => {
            v.as(name);
        });

        return this;
    }

    disabled() {
        this._actual.forEach(v => {
            v.disabled();
        });
    }
    
    enabled() {
        this._actual.forEach(v => {
            v.enabled();
        });
    }

    equals(expected : any) {
        this._actual.forEach(v => {
            v.equals(expected);
        });
     }
}
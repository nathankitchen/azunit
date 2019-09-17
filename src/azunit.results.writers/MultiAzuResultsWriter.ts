import { IAzuResultsWriter } from "./IAzuResultsWriter";
import * as Results from "../azunit.results";

export class MultiAzuResultsWriter implements IAzuResultsWriter {

    constructor(writers: Array<IAzuResultsWriter>) {
        this._writers = writers;
    }

    private _writers: Array<IAzuResultsWriter>;

    write(run: Results.IAzuRunResult) : void {
        if (this._writers) {
            this._writers.forEach(writer => {
                writer.write(run);
            });
        }
    }
}
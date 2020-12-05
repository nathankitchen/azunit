import { IAzuRunResult } from "../azunit-results";

export interface IAzuResultsWriter {
    write(run: IAzuRunResult) : void;
}
import { AzuState } from "../azunit";
import { IAzuResultsWriter } from "./IAzuResultsWriter";
import { IAzuRunResult } from "../azunit.results";

export abstract class BaseAzuResultsWriter implements IAzuResultsWriter {

    protected filename: string;

    constructor(filename: string) {
        this.filename = filename;
    }

    protected resultToText(state: AzuState, lowercase: boolean = false) {
        let stateText = "Ignored";

        switch (state) {
            case AzuState.Failed:
                stateText = "Failed";
                break;
            case AzuState.Passed:
                stateText = "Passed";
                break;
            default:
                stateText = "Ignored";
                break;
        }

        if (lowercase) {
            stateText = stateText.toLowerCase();
        }

        return stateText;
    }

    abstract write(run: IAzuRunResult) : void;

}
import { AzuFileLoaderFunc } from "./AzuFileLoaderFunc";
import { IAzuRunResult } from "../azunit-results";

export interface IAzuSubscription {
    readonly subscriptionId: string;
    createTestRun(name: string, filenames: Array<string>, parameterFile: string, fileLoader: AzuFileLoaderFunc): Promise<Array<IAzuRunResult>>;
    dump(filename: string): void;
}
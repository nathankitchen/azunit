import { AzuFileLoaderFunc } from "./AzuFileLoaderFunc";

export interface IAzuSubscription {
    readonly subscriptionId: string;
    createTestRun(name: string, filenames: Array<string>, parameterFile: string, fileLoader: AzuFileLoaderFunc): Promise<boolean>;
}
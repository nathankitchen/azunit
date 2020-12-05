import { IAzuCultureMessage, AssertionMessage } from "../azunit-i18n";
import * as Results from "../azunit-results";

export interface IAzuLog {
    write(message: IAzuCultureMessage): void;
    error(err: Error): void;

    startRun(name: string, subscription: string, start?: Date): void;
    startGroup(name: string, source: string, start?: Date): void;
    startTest(name: string, start?: Date): void;
    assert(message: AssertionMessage, resourceId: string, resourceName: string, expected: any, actual: any): void;
    endTest(): void;
    endGroup(): void;
    endRun(): Array<Results.IAzuRunResult>;
    abortRun(message: string): Array<Results.IAzuRunResult>;

    trackResource(resourceId: string, resourceName: string): void;
}
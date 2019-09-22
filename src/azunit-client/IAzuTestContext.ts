import { IAzuClientLog, IAzuTestable } from ".";

export interface IAzuTestContext {
    title: string;
    description: string;
    ignore: boolean;
    readonly categories: Array<string>;

    selectResourcesByProvider(provider: string): IAzuTestable;
    selectResourcesByName(name: string): IAzuTestable;

    readonly log: IAzuClientLog;
}
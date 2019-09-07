export type AzuTestFunc = (resources: IAzuTest) => void;

export interface IAzuValue {
    disabled(): void;
    enabled(): void;
    equals(value: any): void;
    as(name: string): IAzuValue;
}

export interface IAzuClientLog {
    trace(message: string) : void;
    write(message: string) : void;
    warning(message: string) : void;
    error(message: string) : void;
}

export interface IAzuTest {
    title: string;
    description: string;
    ignore: boolean;
    readonly categories: Array<string>;

    selectResourcesByProvider(provider: string): IAzuTestable;
    selectResourcesByName(name: string): IAzuTestable;

    readonly log: IAzuClientLog;
}

export interface IAzuTestable {
    shouldHaveInstanceCount: IAzuValue;
    shouldHaveProperty(selector: string): IAzuValue;
}

export function title(name: string,) {};
export function start(name: string, callback: AzuTestFunc) {};
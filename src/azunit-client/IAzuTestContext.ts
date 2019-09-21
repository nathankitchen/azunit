import { AzuTestFunc } from "./AzuTestFunc";

export interface IAzuTestContext {
    test(name: string, callback: AzuTestFunc): void;
    ignore(name: string, reason: string, callback: AzuTestFunc): void;
}
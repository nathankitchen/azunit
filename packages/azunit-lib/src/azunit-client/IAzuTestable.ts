import { IAzuValue } from ".";

export interface IAzuTestable {
    shouldHaveInstanceCount: IAzuValue;
    shouldHaveProperty(selector: string): IAzuValue;
}
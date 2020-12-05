export interface IAzuValue {
    disabled(): void;
    enabled(): void;
    equals(value: any): void;
    as(name: string): IAzuValue;
}
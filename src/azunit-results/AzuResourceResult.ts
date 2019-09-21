export class AzuResourceResult {
    
    constructor(id: string, name: string, assertions: number) {
        this.id = id;
        this.name = name;
        this.assertions = assertions;
    }

    public readonly id: string;
    public readonly name: string;
    public assertions: number = 0;
}

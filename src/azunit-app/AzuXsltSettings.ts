export class AzuXsltSettings {

    constructor(transform: string, output: string) {
        this.transform = transform;
        this.output = output;
    }

    public readonly transform: string = "S";
    public readonly output: string = "";
}
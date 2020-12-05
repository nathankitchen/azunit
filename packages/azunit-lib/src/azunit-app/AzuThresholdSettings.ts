export class AzuThresholdSettings {

    constructor(threshold: number, fail: boolean = false) {
        this.threshold = threshold;
        this.fail = fail;
    }

    public threshold: number = 1;
    public fail: boolean = false;
}
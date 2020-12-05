import { AzuThresholdSettings } from "./AzuThresholdSettings";

export class AzuCoverageSettings {
    public resources: AzuThresholdSettings = new AzuThresholdSettings(100, false);
    public apr: AzuThresholdSettings = new AzuThresholdSettings(1, false);
    public aapr: AzuThresholdSettings = new AzuThresholdSettings(1, false);
}
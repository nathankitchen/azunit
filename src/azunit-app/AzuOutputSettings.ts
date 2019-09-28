import { AzuXsltSettings } from "./AzuXsltSettings";

export class AzuOutputSettings {

    public culture: string = "enGb";
    public silentMode: boolean = false;
    public outputXmlPath: string = "";
    public outputJsonPath: string = "";

    public transforms: Array<AzuXsltSettings> = new Array<AzuXsltSettings>();
}
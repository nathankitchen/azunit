import { AzuAuthSettings } from "./AzuAuthSettings";
import { AzuOutputSettings } from "./AzuOutputSettings";
import { AzuCoverageSettings } from "./AzuCoverageSettings";

import fs from "fs";
import YAML from "yaml";
import { AzuXsltSettings } from "./AzuXsltSettings";
import { isBoolean } from "util";

export class AzuSettings {

    public name: string = "";
    public select: string = "";
    public parameters: string = "";

    public auth: AzuAuthSettings = new AzuAuthSettings();
    public coverage: AzuCoverageSettings = new AzuCoverageSettings();
    public output: AzuOutputSettings = new AzuOutputSettings();

    public static loadYaml(filename: string): AzuSettings {
        const settings = new AzuSettings();
        const data = fs.readFileSync(filename, "utf8");
        const json = YAML.parse(data);

        if (json) {
            settings.name = AzuSettings.parseEnv(json.name);
            settings.select = AzuSettings.parseEnv(json.select);
            settings.parameters = AzuSettings.parseEnv(json.parameters);
            
            if (json.auth) {
                settings.auth.tenant = AzuSettings.parseEnv(json.auth.tenant);
                settings.auth.appId = AzuSettings.parseEnv(json.auth.appId);
                settings.auth.appKey = AzuSettings.parseEnv(json.auth.appKey);
                settings.auth.subscription = AzuSettings.parseEnv(json.auth.subscription);
            }

            if (json.coverage) {
                if (json.coverage.resources) {
                    settings.coverage.resources.threshold = AzuSettings.parseEnvInt(json.coverage.resources.threshold, 0, 100);
                    settings.coverage.resources.fail = AzuSettings.parseEnvBool(json.coverage.resources.fail);
                }
                if (json.coverage.apr) {
                    settings.coverage.apr.threshold = AzuSettings.parseEnvInt(json.coverage.apr.threshold, 0, undefined);
                    settings.coverage.apr.fail = AzuSettings.parseEnvBool(json.coverage.apr.fail);
                }
                if (json.coverage.aapr) {
                    settings.coverage.aapr.threshold = AzuSettings.parseEnvFloat(json.coverage.aapr.threshold, 0, undefined);
                    settings.coverage.aapr.fail = AzuSettings.parseEnvBool(json.coverage.aapr.fail);
                }
            }

            if (json.output) {
                settings.output.culture = AzuSettings.parseEnv(json.output.lang);
                settings.output.silentMode = AzuSettings.parseEnvBool(json.output.silent);
                settings.output.outputJsonPath = AzuSettings.parseEnv(json.output.json);
                settings.output.outputXmlPath = AzuSettings.parseEnv(json.output.xml);

                if (json.output.transforms && Array.isArray(json.output.transforms)) {
                    json.output.transforms.forEach((e : any) => {
                        settings.output.transforms.push(new AzuXsltSettings(AzuSettings.parseEnv(e.transform), AzuSettings.parseEnv(e.output)));
                    });
                }
            }
        }
        return settings;
    }

    private static parseEnv(value: string): string {
        if (value.length > 1 && value[0] == "$") {
            const key = value.substring(1);
            let val =  process.env[key];
            if (val) {
                return val;
            }
            return "";
        }
        
        return value;
    }

    private static parseEnvInt(value: string, min: number, max?: number): number {
        if (value.length > 1 && value[0] == "$") {
            const key = value.substring(1);
            let val =  process.env[key];
            if (val) {
                return Number.parseInt(val);
            }
            return 0;
        }
        
        return Number.parseInt(value);
    }

    private static parseEnvFloat(value: string, min: number, max?: number): number {
        if (value.length > 1 && value[0] == "$") {
            const key = value.substring(1);
            let val =  process.env[key];
            if (val) {
                return Number.parseFloat(val);
            }
            return 0;
        }
        
        return Number.parseFloat(value);
    }

    private static parseEnvBool(value: string): boolean {
        if (value) {
            if (value.length > 1 && value[0] == "$") {
                const key = value.substring(1);
                let val =  process.env[key];
                
                if (val) {
                    return (val.toLowerCase() == "true");
                }
                return false;
            }
            return (value.toString().toLowerCase() == "true");
        }
        return false;
    }
}
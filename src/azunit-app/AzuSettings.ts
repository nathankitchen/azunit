import { AzuAuthSettings } from "./AzuAuthSettings";
import { AzuCoverageSettings } from "./AzuCoverageSettings";
import { AzuOutputSettings } from "./AzuOutputSettings";
import { AzuRunSettings } from "./AzuRunSettings";


import fs from "fs";
import YAML from "yaml";

export class AzuSettings {

    public run: AzuRunSettings = new AzuRunSettings();
    public auth: AzuAuthSettings = new AzuAuthSettings();
    public coverage: AzuCoverageSettings = new AzuCoverageSettings();
    public output: AzuOutputSettings = new AzuOutputSettings();

    public static loadYaml(filename: string): AzuSettings {
        const settings = new AzuSettings();
        const data = fs.readFileSync(filename, "utf8");
        const json = YAML.parse(data);

        if (json) {

            if (json.run) {
                settings.run.name = AzuSettings.parseEnv(json.run.name);
                settings.run.select = AzuSettings.parseEnv(json.run.select);
                settings.run.parameters = AzuSettings.parseEnv(json.run.parameters);
                settings.run.language = AzuSettings.parseEnv(json.run.lang);
                settings.run.silent = AzuSettings.parseEnvBool(json.run.silent);
            }

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
                settings.output.outputJsonPath = AzuSettings.parseEnv(json.output.json);
                settings.output.outputXmlPath = AzuSettings.parseEnv(json.output.xml);
            }
        }
        return settings;
    }

    private static parseEnv(value: string): string {
        if (value) {
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
        return "";
    }

    private static parseEnvInt(value: string, min: number, max?: number): number {
        if (value) {
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
        return 0;
    }

    private static parseEnvFloat(value: string, min: number, max?: number): number {
        if (value) {
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
        return 0;
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
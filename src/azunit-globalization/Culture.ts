import { AzuLocaleEnGb } from "./AzuLocaleEnGb";
import { AzuLocaleTest } from "./AzuLocaleTest";
import { IAzuLocale } from "./IAzuLocale";

export class Culture {
    public static enGb() : IAzuLocale { return new AzuLocaleEnGb(); }
    public static test() : IAzuLocale { return new AzuLocaleTest(); }
}
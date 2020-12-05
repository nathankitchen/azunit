import { AzuTestFunc } from "./AzuTestFunc";
import { IAzuValue } from "./IAzuValue";
import { IAzuClientLog } from "./IAzuClientLog";
import { IAzuTestContext } from "./IAzuTestContext";
import { IAzuTestable } from "./IAzuTestable";
import { IAzuResource } from "./IAzuResource";

export { 
    IAzuTestContext, 
    IAzuTestable,
    IAzuResource,
    IAzuClientLog,
    IAzuValue,
    AzuTestFunc
};

export function title(name: string,) {};
export function start(name: string, callback: AzuTestFunc) {};
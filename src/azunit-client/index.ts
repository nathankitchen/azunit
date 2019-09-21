import { AzuTestFunc } from "./AzuTestFunc";
import { IAzuValue } from "./IAzuValue";
import { IAzuClientLog } from "./IAzuClientLog";
import { IAzuTest } from "./IAzuTest";
import { IAzuTestable } from "./IAzuTestable";




export { 
    IAzuTest, 
    IAzuTestable,
    IAzuClientLog,
    IAzuValue,
    AzuTestFunc 
};

export function title(name: string,) {};
export function start(name: string, callback: AzuTestFunc) {};
import { IAzuTestContext } from "./IAzuTestContext";
import { AzuResource } from "./AzuResource";
import { AzuTestFunc } from "./AzuTestFunc";
import { AzuTest } from "./AzuTest";

export class AzuTestContext implements IAzuTestContext {

    constructor (services: IAzuServices, resources: Array<AzuResource>) {
        this._services = services;
        this._resources = resources;
    }

    private _services: IAzuServices;
    private _resources: Array<AzuResource>;

    /**
    * Performs a series of tests to verify the validity of resources.
    * @param name The name of the test.
    * @param callback A function responsible for running the tests.
    * @returns The subscription, allowing test chaining.
    */
    test(name: string, callback: AzuTestFunc) {

        this._services.log.startTest(name);

        let test = new AzuTest(this._services, name, this._resources);

        try {
            callback(test);
        }
        catch (e) {

        }
        
        this._services.log.endTest();
    }

    /**
    * Performs a series of tests to verify the validity of resources.
    * @param name The name of the test.
    * @param callback A function responsible for running the tests.
    * @returns The subscription, allowing test chaining.
    */
   ignore(name: string, reason: string, callback: AzuTestFunc) {
        this._services.log.startTest(name);

        let test = new AzuTest(this._services, name, this._resources);

        callback(test);

        this._services.log.endTest();
    }
}
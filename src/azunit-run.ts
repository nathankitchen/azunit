import program from "commander";
import * as AzUnit from "./main";
import vm from "vm";
import fs from "fs";
import { AzuTestFunc, IAzuTest } from "./client";
import { IAzuTestResult, AzuTestResult, AzuAssertionResult } from "./io/results";

const langRegex = /[a-z]{2}\-[A-Z]{2}/; // This is pretty lazy and needs a better solution.
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

program
    .option('-t, --tenant <tenant>', 'The domain of the tenant')
    .option('-p, --principal <principal>', 'ID of the service principal with access to target subscription', guidRegex)
    .option('-k, --key <key>', 'Service principal secret')
    .option('-s, --subscription <subscription>', 'The ID of the subscription to test', guidRegex)
    .option('-c --culture [culture]', 'Culture/language code for the run (defaults to en-GB)', langRegex, 'en-GB')
    .option('-n --name [runName]', 'A name for the test run', undefined, 'Test run ' + new Date(Date.now()).toLocaleString())
    .parse(process.argv);

var tests = program.args;

if (!tests.length) {
    console.error('test scripts are required');
    process.exit(1);
}

let runner = AzUnit.createTestRunner();

runner.useServicePrincipal(program.tenant, program.principal, program.key)
    .then((run) => {

        run.name = program.runName;

        run.getSubscription(program.subscription)
            .then((subscription) => {

                subscription.runTests((context) => {

                    let ps = new Array<Promise<Array<IAzuTestResult>>>();

                    tests.forEach((test) => {
                        ps.push(new Promise<Array<IAzuTestResult>>((resolve, reject) => 
                            fs.readFile(test, 'utf8', function (err, data) {

                                if (err) { reject(err); }

                                let results = new Array<IAzuTestResult>();
                                
                                let script = new vm.Script(data);

                                const item = {
                                    test: function(name: string, callback: AzuTestFunc) {
                                        context.test(name, callback);
                                    }
                                };

                                let env = vm.createContext(item);
                
                                script.runInContext(env);

                                let a = new AzuAssertionResult(false, "Yay");

                                let r = new AzuTestResult();

                                r.title = "asdf";
                                r.assertions.push(a);

                                results.push(r);

                                resolve(results);
                            })));
                    });
    
                    return ps;
                })
                .then((results: Array<Array<IAzuTestResult>>) => {

                    let success = true;

                    results.forEach(r => {
                        r.forEach(i => {
                            if (!i.isSuccess()) {
                                success = false;
                            }

                            //console.log(i.title);
                            // Don't do this quite yet...
                        });
                    });

                    if (!success) {
                        console.log("Failed");
                        process.exitCode = 1;
                    }
                    else {
                        console.log("Success");
                        process.exitCode = 1;  
                    }
                    console.log("Completed");
                });
            });

        }).catch((err) => {
            console.log('Failed');
            console.error(err);
            process.exitCode = 1;
        });
import program from "commander";
import * as AzUnit from "./main";
import * as Results from "./io/results";
import * as Writers from "./io/writers";
import * as Globalization from "./i18n/locales";
import vm from "vm";
import fs, { promises } from "fs";
import { AzuTestFunc, IAzuTest } from "./unit/client";
import * as Logs from "./io/log";

const langRegex = /[a-z]{2}\-[A-Z]{2}/; // This is pretty lazy and needs a better solution.
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

program
    .option('-t, --tenant <tenant>', 'The domain of the tenant')
    .option('-p, --principal <principal>', 'ID of the service principal with access to target subscription', guidRegex)
    .option('-k, --key <key>', 'Service principal secret')
    .option('-s, --subscription <subscription>', 'The ID of the subscription to test', guidRegex)
    .option('-c, --run-culture [culture]', 'Culture/language code for the run (defaults to en-GB)', langRegex, 'en-GB')
    .option('-n, --run-name [name]', 'A name for the test run', undefined, 'Test run ' + new Date(Date.now()).toLocaleString())
    .option('-X, --output-xml [path]', 'Name of the file to output results to in XML format')
    .option('-J, --output-json [path]', 'Name of the file to output results to in JSON format')
    .option('-H, --output-html [path]', 'Name of the file to output results to in HTML format')
    .option('-M, --output-md [path]', 'Name of the file to output results to in Markdown format')
    .option('-C, --output-csv [path]', 'Name of the file to output results to in CSV format')
    .option("-x, --silent", "Don't output test results to the command line")
    .parse(process.argv);

var filenames = program.args;

if (!filenames.length) {
    console.error('test scripts are required');
    process.exit(1);
}

let settings = new AzUnit.AzuRunSettings();

settings.silentMode = program.silent;

settings.outputXmlPath = program.outputXml;
settings.outputJsonPath = program.outputJson;
settings.outputHtmlPath = program.outputHtml;
settings.outputMarkdownPath = program.outputMd;
settings.outputCsvPath = program.outputCsv;

let app = AzUnit.createTestRunner(settings);

app.useServicePrincipal(program.tenant, program.principal, program.key)
    .then((principal) => {

        principal.getSubscription(program.subscription)
            .then((subscription) => {

                subscription.createTestRun(program.runName, (run) => {

                    return new Promise<AzUnit.IAzuSubscription>((resolve, reject) => {

                        let fileTestPromises = new Array<Promise<AzUnit.IAzuTestContext>>();

                        filenames.forEach((filename) => {
                    
                            let fileTestPromise = run.testJob((ctx) => {
    
                                return new Promise<AzUnit.IAzuTestContext>((resolve, reject) =>
    
                                    fs.readFile(filename, 'utf8', function (err, data) {

                                        if (err) { reject(err); }
    
                                        let script = new vm.Script(data);
                                        let sandboxTitle = "Untitled";
                                        let sandboxTests = new Array();

                                        const item = {
                                            title: function(title: string) {
                                                sandboxTitle = title;
                                            },
                                            test: function(name: string, callback: AzuTestFunc) {
                                                sandboxTests.push({ name: name, callback: callback });
                                            }
                                        };
    
                                        let env = vm.createContext(item);
    
                                        script.runInContext(env);
    
                                        ctx.log.startGroup(sandboxTitle, filename);
                                        
                                        sandboxTests.forEach(i => { ctx.test(i.name, i.callback); });

                                        ctx.log.endGroup();

                                        resolve(ctx);
                                    }));
                                
                                });
                            
                            fileTestPromises.push(fileTestPromise);
                        });
                        
                        Promise.all(fileTestPromises)
                            .then((fileResults: Array<AzUnit.IAzuTestContext>) => {
                                resolve(subscription);
                            });
                    })
                })
                .then((success) => {
                    process.exitCode = (success) ? 0 : 1;
                })
                .catch((err) => { console.log(err); });
            });

    }).catch((err) => {
        console.log('Fatal error');
        console.error(err);
        process.exitCode = 1;
    });
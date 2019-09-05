import program from "commander";
import * as AzUnit from "./main";
import * as Results from "./io/results";
import * as Writers from "./io/writers";
import * as Globalization from "./i18n/locales";
import vm from "vm";
import fs, { promises } from "fs";
import { AzuTestFunc, IAzuTest } from "./client";
import { IAzuTestResult, AzuTestResult, AzuAssertionResult, AzuFileResult } from "./io/results";
import * as Logs from "./io/log";

const langRegex = /[a-z]{2}\-[A-Z]{2}/; // This is pretty lazy and needs a better solution.
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

program
    .option('-t, --tenant <tenant>', 'The domain of the tenant')
    .option('-p, --principal <principal>', 'ID of the service principal with access to target subscription', guidRegex)
    .option('-k, --key <key>', 'Service principal secret')
    .option('-s, --subscription <subscription>', 'The ID of the subscription to test', guidRegex)
    .option('-rc --run-culture [culture]', 'Culture/language code for the run (defaults to en-GB)', langRegex, 'en-GB')
    .option('-rn --run-name [name]', 'A name for the test run', undefined, 'Test run ' + new Date(Date.now()).toLocaleString())
    .option('-ox --output-xml [path]', 'Name of the file to output results to in XML format')
    .option('-oj --output-json [path]', 'Name of the file to output results to in JSON format')
    .option('-oh --output-html [path]', 'Name of the file to output results to in HTML format')
    .option('-om --output-md [path]', 'Name of the file to output results to in Markdown format')
    .option('-oc --output-csv [path]', 'Name of the file to output results to in CSV format')
    .parse(process.argv);

var filenames = program.args;

if (!filenames.length) {
    console.error('test scripts are required');
    process.exit(1);
}

let culture = Globalization.Culture.enGb();

let settings = new AzUnit.AzuSettings();

let logs = new Array<Logs.IAzuLog>();

let resultsLog = new Logs.ResultsLog(culture);
logs.push(new Logs.ConsoleLog(culture));
logs.push(resultsLog);

settings.log = new Logs.MultiLog(logs);

let app = AzUnit.createTestRunner(settings);

app.useServicePrincipal(program.tenant, program.principal, program.key)
    .then((principal) => {

        principal.getSubscription(program.subscription)
            .then((subscription) => {

                subscription.createTestRun(program.runName, (run) => {

                    return new Promise<Array<Results.IAzuFileResult>>((resolve, reject) => {

                        let fileTestPromises = new Array<Promise<Results.IAzuFileResult>>();

                        filenames.forEach((filename) => {
                    
                            let fileTestPromise = run.testFile((ctx) => {
    
                                return new Promise<Results.IAzuFileResult>((resolve, reject) =>
    
                                    fs.readFile(filename, 'utf8', function (err, data) {
    
                                        

                                        // Starts timing the file run, so needs to be created
                                        // at the start of the function.
                                        let result = new AzuFileResult();

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

                                        result.filename = filename;

                                        if (sandboxTitle) {
                                            result.title = sandboxTitle;
                                        }

                                        result.tests = ctx.getResults();
                                        
                                        ctx.log.endGroup();

                                        resolve(result);
                                    }));
                                
                                });
                            
                            fileTestPromises.push(fileTestPromise);
                        });
                        
                        Promise.all(fileTestPromises)
                            .then((fileResults: Array<Results.IAzuFileResult>) => {
                                resolve(fileResults);
                            });
                    })
                })
                .then((results: Results.IAzuRunResult) => {

                    let success = true;
                    let results2 = resultsLog.getResults();

                    if (results2) {
                        if (program.outputXml) {
                            let xw = new Writers.XmlAzuResultsWriter(program.outputXml);
                            xw.write(results2);
                        }

                        if (program.outputJson) {
                            let jw = new Writers.JsonAzuResultsWriter(program.outputJson);
                            jw.write(results2);
                        }

                        if (program.outputHtml) {
                            let hw = new Writers.HtmlAzuResultsWriter(program.outputHtml);
                            hw.write(results2);
                        }

                        if (program.outputMd) {
                            let mw = new Writers.MarkdownAzuResultsWriter(program.outputMd);
                            mw.write(results2);
                        }

                        if (program.outputCsv) {
                            let cw = new Writers.CsvAzuResultsWriter(program.outputCsv);
                            cw.write(results2);
                        }
                    }

                    if (!success) {
                        console.log("Failed");
                        process.exitCode = 1;
                    }
                    else {
                        console.log("Success");
                        process.exitCode = 0;  
                    }
                    console.log("Completed");
                })
                .catch((err) => { console.log(err); });
            });

    }).catch((err) => {
        console.log('Fatal error');
        console.error(err);
        process.exitCode = 1;
    });
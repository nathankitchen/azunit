import program from "commander";
import * as AzUnit from "./main";
import fs from "fs";

const langRegex = /[a-z]{2}\-[A-Z]{2}/; // This is pretty lazy and needs a better solution.
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

program
    .option('-t, --tenant <tenant>', 'The domain of the tenant')
    .option('-a, --app-id <appId>', 'ID of the application service principal with access to target subscription', guidRegex)
    .option('-k, --app-key <key>', 'Service principal secret')
    .option('-s, --subscription <subscription>', 'The ID of the subscription to test', guidRegex)
    .option('-c, --run-culture [culture]', 'Culture/language code for the run (defaults to en-GB)', langRegex, 'en-GB')
    .option('-n, --run-name [name]', 'A name for the test run', undefined, 'Test run ' + new Date(Date.now()).toLocaleString())
    .option("-x, --silent", "Don't output test results to the command line")
    .option("-p, --parameter-file [path]", "Don't output test results to the command line")
    .option('-X, --output-xml [path]', 'Name of the file to output results to in XML format')
    .option('-J, --output-json [path]', 'Name of the file to output results to in JSON format')
    .option('-H, --output-html [path]', 'Name of the file to output results to in HTML format')
    .option('-M, --output-md [path]', 'Name of the file to output results to in Markdown format')
    .option('-C, --output-csv [path]', 'Name of the file to output results to in CSV format')
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

app.useServicePrincipal(program.tenant, program.appId, program.appKey)
    .then((principal) => {

        principal.getSubscription(program.subscription)
            .then((subscription) => {

                let fileLoader = (filename: string) => { return new Promise<string>((resolve, reject) => {
                    fs.readFile(filename, 'utf8', function (err, data) {
                        resolve(data);
                    });
                });};

                subscription.createTestRun(program.runName, filenames, program.parameterFile, fileLoader)
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
import * as Results from "../azunit.results";
import { BaseAzuResultsWriter } from "./BaseAzuResultsWriter";

var fs = require("fs");

export class MarkdownAzuResultsWriter extends BaseAzuResultsWriter {

    write(run: Results.IAzuRunResult) {
        var ws = fs.createWriteStream(this.filename);

        ws.write("# " + run.name + "\r\n");
        ws.write("Test completed in " + run.getDurationSeconds() + " on " + run.start + ".\r\n");
        ws.write("\r\n");

        run.groups.forEach(group => {

            ws.write("## " + group.name + "\r\n");

            group.tests.forEach(test => {

                ws.write("### " + test.name + "\r\n");

                test.assertions.forEach(assertion => {

                    ws.write("   * " + assertion.message + "\r\n");

                });

                ws.write("\r\n");

            });

            ws.write("\r\n");
        });
    }
}
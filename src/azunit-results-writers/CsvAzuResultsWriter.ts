import * as Results from "../azunit-results";
import { BaseAzuResultsWriter } from "./BaseAzuResultsWriter";

var fs = require("fs");

export class CsvAzuResultsWriter extends BaseAzuResultsWriter {

    write(run: Results.IAzuRunResult) {
        var ws = fs.createWriteStream(this.filename);

        ws.write(this.encodeRow(["Subscription", "Run", "Group", "Test", "Assertion", "Result"]));

        run.groups.forEach(file => {
            file.tests.forEach(test => {
                test.assertions.forEach(assertion => {
                    ws.write(this.encodeRow([run.subscription, "Run", "File", test.name, "Assertion", "Success"]));
                });
            });
        });
    }

    protected encodeColumn(value: string): string {
        return "\"" + value + "\"";
    }

    protected encodeRow(value: Array<string>): string {

        let row = "";
        
        if (value.length > 0) {
            value.forEach((c, i) => {
                row += this.encodeColumn(c);

                if (i < value.length - 1) {
                    row += ",";
                }
            });
        }
        
        return row;
    }
}
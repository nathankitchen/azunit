import * as Results from "../azunit.results";
import { BaseAzuResultsWriter } from "./BaseAzuResultsWriter";

var fs = require("fs");

export class JsonAzuResultsWriter extends BaseAzuResultsWriter {

    write(run: Results.IAzuRunResult) {

        let doc = {
            title: run.name,
            start: run.start,
            duration: run.getDurationSeconds(),
            subscription: run.subscription,
            result: this.resultToText(run.getState()),
            groups: new Array()
        };

        run.groups.forEach(group => {

            let fileDoc = {
                name: group.name,
                source: group.source,
                start: group.start,
                duration: group.getDurationSeconds(),
                result: this.resultToText(group.getState()),
                tests: new Array()
            };

            group.tests.forEach(test => {

                let testDoc = {
                    name: test.name,
                    start: test.start,
                    duration: test.getDurationSeconds(),
                    result: this.resultToText(test.getState()),
                    assertions: new Array()
                };

                test.assertions.forEach(assertion => {
                    testDoc.assertions.push({
                        message: assertion.message,
                        result: this.resultToText(assertion.getState())
                    });
                });

                fileDoc.tests.push(testDoc)
            });

            doc.groups.push(fileDoc);
        });

        var ws = fs.createWriteStream(this.filename);
        ws.write(JSON.stringify(doc, null, "\t"));
    }
}
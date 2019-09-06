import * as Results from "./results";
var XMLWriter = require('xml-writer');
var fs = require('fs');

export interface IAzuResultsWriter {
    write(run: Results.IAzuRunResult) : void;
}

export class MultiAzuResultsWriter implements IAzuResultsWriter {

    constructor(writers: Array<IAzuResultsWriter>) {
        this._writers = writers;
    }

    private _writers: Array<IAzuResultsWriter>;

    write(run: Results.IAzuRunResult) : void {
        if (this._writers) {
            this._writers.forEach(writer => {
                writer.write(run);
            });
        }
    }
}

export abstract class AzuResultsWriter implements IAzuResultsWriter {

    protected filename: string;

    constructor(filename: string) {
        this.filename = filename;
    }

    protected stateToText(state: Results.AzuState, lowercase: boolean = false) {
        let stateText = "Ignored";

        switch (state) {
            case Results.AzuState.Failed:
                stateText = "Failed";
                break;
            case Results.AzuState.Passed:
                stateText = "Passed";
                break;
            default:
                stateText = "Ignored";
                break;
        }

        if (lowercase) {
            stateText = stateText.toLowerCase();
        }

        return stateText;
    }

    abstract write(run: Results.IAzuRunResult) : void;

}

export class XmlAzuResultsWriter extends AzuResultsWriter {

    write(run: Results.IAzuRunResult) {

        var ws = fs.createWriteStream(this.filename);

        let xw = new XMLWriter(true, function(string: string, encoding: string) {
            ws.write(string, encoding);
        });

        xw.startDocument('1.0', 'UTF-8')
            .startElement('azunit')
            .writeAttribute('name', run.name)
            .writeAttribute('subscription', run.subscription)
            .writeAttribute('startTime', run.start.toISOString())
            .writeAttribute('duration', run.duration)
            .writeAttribute('state', this.stateToText(run.getState()));
        
        xw.startElement("results");

        run.groups.forEach(group => {

            xw.startElement('group')
                .writeAttribute('name', group.name)    
                .writeAttribute('source', group.source)
                .writeAttribute('startTime', group.start.toISOString())
                .writeAttribute('duration', group.duration)
                .writeAttribute('state', this.stateToText(group.getState()));

            group.tests.forEach(test => {

                xw.startElement('test')
                    .writeAttribute('name', test.name)
                    .writeAttribute('startTime', test.start.toISOString())
                    .writeAttribute('duration', test.duration)
                    .writeAttribute('state', this.stateToText(test.getState()));

                test.assertions.forEach(assertion => {

                    xw.startElement('assertion')
                        .writeAttribute('state', this.stateToText(assertion.getState()))
                        .text(assertion.message)
                        .endElement();
                });

                xw.endElement();
            });

            xw.endElement();
            xw.endDocument();
        });

        xw.endElement();
        xw.startElement("coverage")
            .writeAttribute("total", 25)
            .writeAttribute("count", 3)
            .writeAttribute("percent", 12)
            .writeAttribute("state", 12)
            .endElement();

        xw.endElement();
        ws.end();
    }
}

export class JsonAzuResultsWriter extends AzuResultsWriter {

    write(run: Results.IAzuRunResult) {

        let doc = {
            title: run.name,
            start: run.start,
            duration: run.duration,
            subscription: run.subscription,
            state: this.stateToText(run.getState()),
            groups: new Array()
        };

        run.groups.forEach(group => {

            let fileDoc = {
                name: group.name,
                source: group.source,
                start: group.start,
                duration: group.duration,
                state: this.stateToText(group.getState()),
                tests: new Array()
            };

            group.tests.forEach(test => {

                let testDoc = {
                    name: test.name,
                    start: test.start,
                    duration: test.duration,
                    state: this.stateToText(test.getState()),
                    assertions: new Array()
                };

                test.assertions.forEach(assertion => {
                    testDoc.assertions.push({
                        message: assertion.message,
                        state: this.stateToText(assertion.getState())
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

export class HtmlAzuResultsWriter extends AzuResultsWriter {

    write(run: Results.IAzuRunResult) {

        var ws = fs.createWriteStream(this.filename);

        let xw = new XMLWriter(true, function(string: string, encoding: string) {
            ws.write(string, encoding);
        });

        let styles = "\r\n\t\t\tbody { font-family: sans-serif; }\r\n"
            + "\t\t\tol { list-style-type: none; }"
            + "\t\t\tli.failed:before { content: \"\\2718\"; margin:0 5px 0 -15px; color: #800; }\r\n"
            + "\t\t\tli.passed:before { content: \"\\2714\"; margin:0 5px 0 -15px; color: #080; }\r\n"
            + "\t\t\tli.ignored:before { content: \"\\23F8\"; margin:0 5px 0 -15px; color: #888; }\r\n"
            + "\t\t\tli.ignored { color: #444; }\r\n";
            
        xw.startElement("html")
            .startElement("head")
            .startElement("name").text(run.name).endElement()
            .startElement("style").text(styles).endElement()
            .endElement()
            .startElement("body")
            .startElement("main")
            .startElement("header").writeAttribute("class", this.stateToText(run.getState(), true))
            .startElement("h1").text(run.name).endElement()
            .startElement("span").text(run.subscription).endElement();

        this.writeHeaderInfo(xw, run.start, run.duration);

        xw.endElement();

        run.groups.forEach(group => {

            xw.startElement("article");
            xw.startElement("header").writeAttribute("class", this.stateToText(group.getState(), true));
            xw.startElement("h2").text(group.name).endElement();

            this.writeHeaderInfo(xw, group.start, group.duration);

            xw.endElement(); // header
            xw.startElement("section");

            group.tests.forEach(test => {

                xw.startElement("div").writeAttribute("class", this.stateToText(test.getState(), true));
                xw.startElement('h3').text(test.name).endElement();
                this.writeHeaderInfo(xw, test.start, test.duration);
                xw.startElement("ol");

                test.assertions.forEach(assertion => {

                    xw.startElement("li")
                        .writeAttribute("class", this.stateToText(assertion.getState(), true))
                        .text(assertion.message)
                        .endElement();

                });

                xw.endElement() // ol
                xw.endElement() // div

            });
            
            xw.endElement() //section
            xw.endElement() //article
        });

        xw.endElement(); // main
        xw.endElement(); // body
        xw.endElement(); // html
    }

    private writeHeaderInfo(xw: any, start: Date, duration: number) {
        xw.startElement("p")
            .text("Completed in ")
            .startElement("time")
                .writeAttribute("datetime", "PT" + duration + "S")
                .text(duration)
                .endElement()
            .text(" seconds on ")
            .startElement("time")
                .writeAttribute("datetime", start.toISOString())
                .text(start.toUTCString())
                .endElement()
            .endElement();
    }
}

export class MarkdownAzuResultsWriter extends AzuResultsWriter {

    write(run: Results.IAzuRunResult) {
        var ws = fs.createWriteStream(this.filename);

        ws.write("# " + run.name + "\r\n");
        ws.write("Test completed in " + run.duration + " on " + run.start + ".\r\n");
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

export class CsvAzuResultsWriter extends AzuResultsWriter {

    write(run: Results.IAzuRunResult) {
        var ws = fs.createWriteStream(this.filename);

        ws.write("\"Subscription\", \"Run\", \"File\", \"Test\", \"Assertion\", \"Success\"");

        run.groups.forEach(file => {
            file.tests.forEach(test => {
                test.assertions.forEach(assertion => {
                    ws.write("\"" + run.subscription + "\", \"Run\", \"File\", \"" + test.name + "\", \"Assertion\", \"Success\"");


                });
            });
        });
    }
}
import * as Results from "./results";
var XMLWriter = require('xml-writer');
var fs = require('fs');

export interface IAzuResultsWriter {
    write(run: Results.IAzuRunResult) : void;
}

export abstract class AzuResultsWriter implements IAzuResultsWriter {

    protected filename: string;

    constructor(filename: string) {
        this.filename = filename;
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
            .writeAttribute('title', run.title)
            .writeAttribute('subscription', run.subscription)
            .writeAttribute('startTime', run.start.toISOString())
            .writeAttribute('duration', run.duration)
            .writeAttribute('success', run.isSuccess() ? "true" : "false");

        run.files.forEach(file => {

            xw.startElement('file')
                .writeAttribute('title', file.title)    
                .writeAttribute('name', file.filename)
                .writeAttribute('startTime', file.start.toISOString())
                .writeAttribute('duration', file.duration)
                .writeAttribute('success', file.isSuccess() ? "true" : "false");

            file.tests.forEach(test => {

                xw.startElement('test')
                    .writeAttribute('title', test.title)
                    .writeAttribute('startTime', test.start.toISOString())
                    .writeAttribute('duration', test.duration)
                    .writeAttribute('success', test.isSuccess() ? "true" : "false");

                test.assertions.forEach(assertion => {

                    xw.startElement('assertion')
                        .writeAttribute('success', assertion.isSuccess() ? "true" : "false")
                        .text(assertion.message)
                        .endElement();
                });

                xw.endElement();
            });

            xw.endElement();
            xw.endDocument();
        });

        xw.endElement();
        ws.end();
    }
}

export class JsonAzuResultsWriter extends AzuResultsWriter {

    write(run: Results.IAzuRunResult) {

        let doc = {
            title: run.title,
            start: run.start,
            duration: run.duration,
            subscription: run.subscription,
            success: run.isSuccess(),
            files: new Array()
        };

        run.files.forEach(file => {

            let fileDoc = {
                title: file.title,
                name: file.filename,
                start: file.start,
                duration: file.duration,
                success: file.isSuccess(),
                tests: new Array()
            };

            file.tests.forEach(test => {

                let testDoc = {
                    title: test.title,
                    start: test.start,
                    duration: test.duration,
                    success: test.isSuccess(),
                    assertions: new Array()
                };

                test.assertions.forEach(assertion => {
                    testDoc.assertions.push({
                        message: assertion.message,
                        success: assertion.isSuccess()
                    });
                });

                fileDoc.tests.push(testDoc)
            });

            doc.files.push(fileDoc);
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


        xw.startElement("html")
            .startElement("head")
            .startElement("title").text(run.title).endElement()
            .endElement()
            .startElement("body")
            .startElement("main")
            .startElement("header").writeAttribute("class", run.isSuccess() ? "success" : "failure")
            .startElement("h1").text(run.title).endElement()
            .startElement("span").text(run.subscription).endElement()
            .startElement("span").text(run.duration).endElement()
            .startElement("time").text(run.start.toISOString()).endElement()
            .endElement();

        run.files.forEach(file => {

            xw.startElement("article");
            xw.startElement("header");
            xw.startElement("h2").text(file.title).endElement();
            xw.endElement(); // header
            xw.startElement("section");

            file.tests.forEach(test => {

                xw.startElement("div");
                xw.startElement('h3').text(test.title).endElement();
                xw.startElement("ol");

                test.assertions.forEach(assertion => {

                    xw.startElement("li")
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
}

export class MarkdownAzuResultsWriter extends AzuResultsWriter {

    write(run: Results.IAzuRunResult) {
        var ws = fs.createWriteStream(this.filename);

        ws.write("# " + run.title + "\r\n");
        ws.write("Test completed in " + run.duration + " on " + run.start + ".\r\n");

        run.files.forEach(file => {



            file.tests.forEach(test => {


                test.assertions.forEach(assertion => {


                });

            });
        });
    }
}

export class CsvAzuResultsWriter extends AzuResultsWriter {

    write(run: Results.IAzuRunResult) {
        var ws = fs.createWriteStream(this.filename);

        ws.write("\"Subscription\", \"Run\", \"File\", \"Test\", \"Assertion\", \"Success\"");

        run.files.forEach(file => {
            file.tests.forEach(test => {
                test.assertions.forEach(assertion => {
                    ws.write("\"" + run.subscription + "\", \"Run\", \"File\", \"" + test.title + "\", \"Assertion\", \"Success\"");


                });
            });
        });
    }
}
import { BaseAzuResultsWriter } from "./BaseAzuResultsWriter";
import * as Results from "../azunit-results";

var fs = require("fs");
var XMLWriter = require("xml-writer");

export class HtmlAzuResultsWriter extends BaseAzuResultsWriter {

    write(run: Results.IAzuRunResult) {

        var ws = fs.createWriteStream(this.filename);

        let xw = new XMLWriter(true, function(string: string, encoding: string) {
            ws.write(string, encoding);
        });

        let styles = "\r\n\t\t\tbody { font-family: sans-serif; }\r\n"
            + "\t\t\tol { list-style-type: none; }\r\n"
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
            .startElement("header").writeAttribute("class", this.resultToText(run.getState(), true))
            .startElement("h1").text(run.name).endElement()
            .startElement("span").text(run.subscription).endElement();

        this.writeHeaderInfo(xw, run.start, run.getDurationSeconds());

        xw.endElement();

        run.groups.forEach(group => {

            xw.startElement("article");
            xw.startElement("header").writeAttribute("class", this.resultToText(group.getState(), true));
            xw.startElement("h2").text(group.name).endElement();

            this.writeHeaderInfo(xw, group.start, group.getDurationSeconds());

            xw.endElement(); // header
            xw.startElement("section");

            group.tests.forEach(test => {

                xw.startElement("div").writeAttribute("class", this.resultToText(test.getState(), true));
                xw.startElement('h3').text(test.name).endElement();
                this.writeHeaderInfo(xw, test.start, test.getDurationSeconds());
                xw.startElement("ol");

                test.assertions.forEach(assertion => {

                    xw.startElement("li")
                        .writeAttribute("class", this.resultToText(assertion.getState(), true))
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
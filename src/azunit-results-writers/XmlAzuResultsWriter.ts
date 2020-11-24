import * as Results from "../azunit-results";
import { BaseAzuResultsWriter } from "./BaseAzuResultsWriter";

var fs = require("fs");
var getDirName = require('path').dirname;
var XMLWriter = require("xml-writer");

export class XmlAzuResultsWriter extends BaseAzuResultsWriter {

    write(run: Results.IAzuRunResult) {

        fs.mkdir(getDirName(this.filename), { recursive: true }, (err: Error) => {
            if (err) throw err;
        });
        
        var ws = fs.createWriteStream(this.filename);

        let writer = (message: string, encoding: string) => {
            ws.write(message, encoding);
        }

        this.writeXml(run, writer);

        ws.end();
    }

    protected writeXml(run: Results.IAzuRunResult, writer: (message: string, encoding: string) => void) {

        let xw = new XMLWriter(true, writer);

        xw.startDocument('1.0', 'UTF-8')
            .startElement('azunit')
            .writeAttribute('name', run.name)
            .writeAttribute('subscription', run.subscription)
            .writeAttribute('start', run.start.toISOString());

        if (run.end) {
            xw.writeAttribute('end', run.end.toISOString());
        }

        xw.writeAttribute('duration', run.getDurationSeconds())
            .writeAttribute('result', this.resultToText(run.getState()));
        
        xw.startElement("results");

        run.groups.forEach(group => {

            xw.startElement('group')
                .writeAttribute('name', group.name)    
                .writeAttribute('source', group.source)
                .writeAttribute('start', group.start.toISOString());

            if (group.end) {
                xw.writeAttribute('end', group.end.toISOString());
            }

            xw.writeAttribute('duration', group.getDurationSeconds())
                .writeAttribute('result', this.resultToText(group.getState()));

            group.tests.forEach(test => {

                xw.startElement('test')
                    .writeAttribute('name', test.name)
                    .writeAttribute('start', test.start.toISOString());

                if (test.end) {
                    xw.writeAttribute('end', test.end.toISOString());
                }

                xw.writeAttribute('duration', test.getDurationSeconds())
                    .writeAttribute('result', this.resultToText(test.getState()));
                
                test.assertions.forEach(assertion => {

                    xw.startElement('assertion')
                        .writeAttribute('result', this.resultToText(assertion.getState()))
                        .text(assertion.message)
                        .endElement();
                });

                xw.endElement();
            });

            xw.endElement();
            xw.endDocument();
        });

        xw.endElement();

        let totalResources = 0;
        let testedResources = 0;
        let totalAssertions = 0;

        run.resources.forEach((resource) => {
            totalResources++;
            totalAssertions += resource.assertions;
            
            if (resource.assertions > 0) {
                testedResources++;
            }
        });

        xw.startElement("coverage")
            .writeAttribute("total", totalResources)
            .writeAttribute("tested", testedResources)
            .writeAttribute("percent", (testedResources / totalResources) * 100)
            .writeAttribute("assertions", totalAssertions);
        
        run.resources.forEach((resource) => {
            xw.startElement("resource")
                .writeAttribute("id", resource.id)
                .writeAttribute("assertions", resource.assertions)
                .text(resource.name)
                .endElement();
        });
        
        xw.endElement();

        xw.endElement();
    }
}
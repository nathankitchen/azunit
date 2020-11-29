import "mocha";
import assert = require("assert");
import * as Log from "../../src/azunit-results-logging";
import * as Messages from "../../src/azunit-i18n";
import * as Globalization from "../../src/azunit-globalization";

describe("ConsoleLog", function() {
    describe("#write()", function() {
        it("writes to log", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.clientText("A");
            log.write(message);
            assert.strictEqual(messages[0], message.toString(locale));
        });
    });
    describe("#error()", function() {
        it("writes to log", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let error = new Error("1");
            let message = Messages.Resources.fatalError(error);
            log.error(error);
            assert.strictEqual(messages[0], message.toString(locale));
        });
    });
    describe("#startRun()", function() {
        it("writes to log", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let start = new Date(2000, 1, 1, 0, 0, 0, 0);
            log.startRun("name", "subscription", start);
            assert.strictEqual(messages[0].indexOf("name") > 0, true);
        });
        it("fails out of order", function() {
            let exceptionHandled = false;
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let start = new Date(2000, 1, 1, 0, 0, 0, 0);
            log.startRun("name", "subscription", start);
            try {
                log.startRun("name", "subscription", start);
            }
            catch (ex) {
                exceptionHandled = ex.message == "Logging failure: a run had already been started.";
            }
            assert.strictEqual(exceptionHandled, true);
        });
    });
    describe("#startGroup()", function() {
        it("writes to log", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            assert.strictEqual(messages[0].indexOf("name") > 0, true);
            assert.strictEqual(messages[0].indexOf("subscription") > 0, true);
            assert.strictEqual(messages[1].indexOf("group") > 0, true);
            assert.strictEqual(messages[1].indexOf("source") > 0, true);
        });
        it("fails out of order", function() {
            let exceptionHandled = false;
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            try {
                log.startGroup("group", "source", startGroup);
            }
            catch (ex) {
                exceptionHandled = ex.message == "Logging failure: a test group has already been started.";
            }
            assert.strictEqual(exceptionHandled, true);
        });
    });
    describe("#startTest()", function() {
        it("writes to log", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            let startTest = new Date(2000, 1, 1, 0, 0, 2, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startTest);
            assert.strictEqual(messages[0].indexOf("name") > 0, true);
            assert.strictEqual(messages[0].indexOf("subscription") > 0, true);
            assert.strictEqual(messages[1].indexOf("group") > 0, true);
            assert.strictEqual(messages[1].indexOf("source") > 0, true);
            assert.strictEqual(messages[2].indexOf("test") > 0, true);
        });
    });
    describe("#assert()", function() {
        it("writes to log", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.getAssertionEqualsSuccessMessage("name", "resource", 5, 5);
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startGroup);
            log.assert(message, "resourceId", "resource", 5, 5);
            assert.strictEqual(messages[0].indexOf("name") > 0, true);
            assert.strictEqual(messages[0].indexOf("subscription") > 0, true);
            assert.strictEqual(messages[1].indexOf("group") > 0, true);
            assert.strictEqual(messages[1].indexOf("source") > 0, true);
            assert.strictEqual(messages[2].indexOf("test") > 0, true);
            assert.strictEqual(messages[3].indexOf("resource") > 0, true);
        });
    });
    describe("#endTest()", function() {
        it("writes to log", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.getAssertionEqualsSuccessMessage("name", "resource", 5, 5);
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startGroup);
            log.assert(message, "resourceId", "resource", 5, 5);
            log.endTest();
            assert.strictEqual(messages.length, 4);
        });
    });
    describe("#endGroup()", function() {
        it("writes to log", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.getAssertionEqualsSuccessMessage("name", "resource", 5, 5);
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startGroup);
            log.assert(message, "resourceId", "resource", 5, 5);
            log.endTest();
            log.endGroup();
            assert.strictEqual(messages.length, 4);
        });
    });
    describe("#endRun)", function() {
        it("writes to log", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.getAssertionEqualsSuccessMessage("name", "resource", 5, 5);
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startGroup);
            log.assert(message, "resourceId", "resource", 5, 5);
            log.endTest();
            log.endGroup();
            log.endRun();
            assert.strictEqual(messages.length, 4);
        });
    });
    describe("#abortRun)", function() {
        it("writes to log from test", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.getAssertionEqualsSuccessMessage("name", "resource", 5, 5);
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startGroup);
            log.assert(message, "resourceId", "resource", 5, 5);
            log.abortRun("abort");
            assert.strictEqual(messages.length, 4);
        });
        it("writes to log from group", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.getAssertionEqualsSuccessMessage("name", "resource", 5, 5);
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startGroup);
            log.assert(message, "resourceId", "resource", 5, 5);
            log.endTest();
            log.abortRun("abort");
            assert.strictEqual(messages.length, 4);
        });
        it("writes to log from run", function() {
            let locale = Globalization.Culture.test();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.getAssertionEqualsSuccessMessage("name", "resource", 5, 5);
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startGroup);
            log.assert(message, "resourceId", "resource", 5, 5);
            log.endTest();
            log.endGroup();
            log.abortRun("abort");
            assert.strictEqual(messages.length, 4);
        });
    });
});
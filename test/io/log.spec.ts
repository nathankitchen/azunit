import "mocha";
import assert = require("assert");
import * as Log from "../../src/io/log";

import * as Globalization from "../../src/azunit.globalization";
import * as Results from "../../src/io/results";
import * as Messages from "../../src/azunit.globalization.messages";
import { AzuLocaleTest } from "../azunit.globalization/locales.test";

describe("ConsoleLog", function() {
    describe("#write()", function() {
        it("writes to log", function() {
            let locale = new AzuLocaleTest();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.clientText("A");
            log.write(message);
            assert.equal(messages[0], message.toString(locale));
        });
    });
    describe("#error()", function() {
        it("writes to log", function() {
            let locale = new AzuLocaleTest();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let error = new Error("1");
            let message = Messages.Resources.fatalError(error);
            log.error(error);
            assert.equal(messages[0], message.toString(locale));
        });
    });
    describe("#startRun()", function() {
        it("writes to log", function() {
            let locale = new AzuLocaleTest();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let start = new Date(2000, 1, 1, 0, 0, 0, 0);
            log.startRun("name", "subscription", start);
            assert.equal(messages[0].indexOf("name") > 0, true);
        });
    });
    describe("#startGroup()", function() {
        it("writes to log", function() {
            let locale = new AzuLocaleTest();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            assert.equal(messages[0].indexOf("name") > 0, true);
            assert.equal(messages[0].indexOf("subscription") > 0, true);
            assert.equal(messages[1].indexOf("group") > 0, true);
            assert.equal(messages[1].indexOf("source") > 0, true);
        });
    });
    describe("#startTest()", function() {
        it("writes to log", function() {
            let locale = new AzuLocaleTest();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            let startTest = new Date(2000, 1, 1, 0, 0, 2, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startTest);
            assert.equal(messages[0].indexOf("name") > 0, true);
            assert.equal(messages[0].indexOf("subscription") > 0, true);
            assert.equal(messages[1].indexOf("group") > 0, true);
            assert.equal(messages[1].indexOf("source") > 0, true);
            assert.equal(messages[2].indexOf("test") > 0, true);
        });
    });
    describe("#assert()", function() {
        it("writes to log", function() {
            let locale = new AzuLocaleTest();
            let messages = new Array<string>();
            let log = new Log.ConsoleLog(locale, (text: string) => { messages.push(text); });
            let message = Messages.Resources.getAssertionEqualsSuccessMessage("name", "resource", 5, 5);
            let startRun = new Date(2000, 1, 1, 0, 0, 0, 0);
            let startGroup = new Date(2000, 1, 1, 0, 0, 1, 0);
            log.startRun("name", "subscription", startRun);
            log.startGroup("group", "source", startGroup);
            log.startTest("test", startGroup);
            log.assert(message, "resourceId", "resource", 5, 5);
            assert.equal(messages[0].indexOf("name") > 0, true);
            assert.equal(messages[0].indexOf("subscription") > 0, true);
            assert.equal(messages[1].indexOf("group") > 0, true);
            assert.equal(messages[1].indexOf("source") > 0, true);
            assert.equal(messages[2].indexOf("test") > 0, true);
            assert.equal(messages[3].indexOf("resource") > 0, true);
        });
    });
    describe("#endTest()", function() {
        it("writes to log", function() {
            let locale = new AzuLocaleTest();
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
            assert.equal(messages.length, 4);
        });
    });
    describe("#endGroup()", function() {
        it("writes to log", function() {
            let locale = new AzuLocaleTest();
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
            assert.equal(messages.length, 4);
        });
    });
    describe("#endRun)", function() {
        it("writes to log", function() {
            let locale = new AzuLocaleTest();
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
            assert.equal(messages.length, 4);
        });
    });
    describe("#abortRun)", function() {
        it("writes to log from test", function() {
            let locale = new AzuLocaleTest();
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
            assert.equal(messages.length, 4);
        });
        it("writes to log from group", function() {
            let locale = new AzuLocaleTest();
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
            assert.equal(messages.length, 4);
        });
        it("writes to log from run", function() {
            let locale = new AzuLocaleTest();
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
            assert.equal(messages.length, 4);
        });
    });
});
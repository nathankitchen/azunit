import "mocha";
import { AzuState } from "../../src/azunit";
import * as Results from "../../src/azunit-results";
import assert = require("assert");

describe("AzuRunResult", function() {
    describe("#constructor()", function() {
        it("should set properties from constructor", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let run = new Results.AzuRunResult("name", "subscription", start);
            assert.equal(run.name, "name");
            assert.equal(run.subscription, "subscription");
            assert.equal(run.start, start);
            assert.equal(run.end, null);
            assert.notEqual(run.groups, null);
            assert.notEqual(run.resources, null);
        });
    });
    describe("#getDurationSeconds()", function() {
        it("should calculate from start and end times", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let run = new Results.AzuRunResult("name", "subscription", start);
            run.end = new Date(2000, 1, 1, 0, 0, 1, 0);
            assert.equal(run.getDurationSeconds(), 1);
        });
        it("should return zero with no end time set", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let run = new Results.AzuRunResult("name", "subscription", start);
            assert.equal(run.getDurationSeconds(), 0);
        });
    });
    describe("#getState()", function() {
        it("should return ignored with empty groups", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let run = new Results.AzuRunResult("name", "subscription", start);
            assert.equal(run.getState(), AzuState.Ignored);
        });
        it("should return pass with single succeeding test", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let run = new Results.AzuRunResult("name", "subscription", start);
            let group = new Results.AzuGroupResult("name", "source", start);
            let test = new Results.AzuTestResult("name");
            let assertion = new Results.AzuAssertionResult(AzuState.Passed, "message");
            test.assertions.push(assertion);
            group.tests.push(test);
            run.groups.push(group);
            assert.equal(run.getState(), AzuState.Passed);
        });
        it("should return fail with single failed assertion", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let run = new Results.AzuRunResult("name", "subscription", start);
            let group = new Results.AzuGroupResult("name", "source", start);
            let test = new Results.AzuTestResult("name");
            let assertion = new Results.AzuAssertionResult(AzuState.Failed, "message");
            test.assertions.push(assertion);
            group.tests.push(test);
            run.groups.push(group);
            assert.equal(group.getState(), AzuState.Failed);
        });
        it("should return fail with all success assertions and one fail assertion", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let run = new Results.AzuRunResult("name", "subscription", start);
            let group1 = new Results.AzuGroupResult("name", "source", start);
            let group2 = new Results.AzuGroupResult("name", "source", start);
            let test1 = new Results.AzuTestResult("name");
            let test2 = new Results.AzuTestResult("name");
            let test3 = new Results.AzuTestResult("name");
            let test4 = new Results.AzuTestResult("name");
            let assertion1 = new Results.AzuAssertionResult(AzuState.Failed, "message");
            let assertion2 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            let assertion3 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            let assertion4 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            let assertion5 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            let assertion6 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            let assertion7 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            let assertion8 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            test1.assertions.push(assertion1);
            test1.assertions.push(assertion2);
            test2.assertions.push(assertion3);
            test2.assertions.push(assertion4);
            test3.assertions.push(assertion5);
            test3.assertions.push(assertion6);
            test4.assertions.push(assertion7);
            test4.assertions.push(assertion8);
            group1.tests.push(test1);
            group2.tests.push(test2);
            run.groups.push(group1);
            run.groups.push(group2);
            assert.equal(run.getState(), AzuState.Failed);
        });
    });
});

describe("AzuGroupResult", function() {
    describe("#constructor()", function() {
        it("should set properties from constructor", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let group = new Results.AzuGroupResult("name", "source", start);
            assert.equal(group.name, "name");
            assert.equal(group.source, "source");
            assert.equal(group.start, start);
            assert.equal(group.end, null);
            assert.notEqual(group.tests, null);
        });
    });
    describe("#getState()", function() {
        it("should return ignored with empty tests", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let group = new Results.AzuGroupResult("name", "subscription", start);
            assert.equal(group.getState(), AzuState.Ignored);
        });
        it("should return pass with single succeeding test", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let group = new Results.AzuGroupResult("name", "source", start);
            let test = new Results.AzuTestResult("name");
            let assertion = new Results.AzuAssertionResult(AzuState.Passed, "message");
            test.assertions.push(assertion);
            group.tests.push(test);
            assert.equal(group.getState(), AzuState.Passed);
        });
        it("should return fail with single failed assertion", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let group = new Results.AzuGroupResult("name", "source", start);
            let test = new Results.AzuTestResult("name");
            let assertion = new Results.AzuAssertionResult(AzuState.Failed, "message");
            test.assertions.push(assertion);
            group.tests.push(test);
            assert.equal(group.getState(), AzuState.Failed);
        });
        it("should return fail with all success assertions and one fail assertion", function() {
            let start = new Date(2000, 1, 1, 0, 0, 0, 0)
            let group = new Results.AzuGroupResult("name", "source", start);
            let test1 = new Results.AzuTestResult("name");
            let test2 = new Results.AzuTestResult("name");
            let assertion1 = new Results.AzuAssertionResult(AzuState.Failed, "message");
            let assertion2 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            let assertion3 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            let assertion4 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            test1.assertions.push(assertion1);
            test1.assertions.push(assertion2);
            test2.assertions.push(assertion3);
            test2.assertions.push(assertion4);
            group.tests.push(test1);
            group.tests.push(test2);
            assert.equal(group.getState(), AzuState.Failed);
        });
    });
});

describe("AzuTestResult", function() {
    describe("#constructor()", function() {
        it("should set properties from constructor", function() {
            let test = new Results.AzuTestResult("name");
            assert.equal(test.name, "name");
            assert.equal(test.end, null);
            assert.notEqual(test.assertions, null);
        });
    });
    describe("#getState()", function() {
        it("should return pass with single success assertion", function() {
            let test = new Results.AzuTestResult("name");
            let assertion = new Results.AzuAssertionResult(AzuState.Passed, "message");
            test.assertions.push(assertion);
            assert.equal(test.getState(), AzuState.Passed);
        });
        it("should return fail with single failed assertion", function() {
            let test = new Results.AzuTestResult("name");
            let assertion = new Results.AzuAssertionResult(AzuState.Failed, "message");
            test.assertions.push(assertion);
            assert.equal(test.getState(), AzuState.Failed);
        });
        it("should return ignored with single ignored assertion", function() {
            let test = new Results.AzuTestResult("name");
            let assertion = new Results.AzuAssertionResult(AzuState.Ignored, "message");
            test.assertions.push(assertion);
            assert.equal(test.getState(), AzuState.Ignored);
        });
        it("should return fail with one success assertion and one fail assertion", function() {
            let test = new Results.AzuTestResult("name");
            let assertion1 = new Results.AzuAssertionResult(AzuState.Failed, "message");
            let assertion2 = new Results.AzuAssertionResult(AzuState.Passed, "message");
            test.assertions.push(assertion1);
            test.assertions.push(assertion2);
            assert.equal(test.getState(), AzuState.Failed);
        });
    });
});

describe("AzuAssertionResult", function() {
    describe("#constructor()", function() {
        it("should set properties from constructor", function() {
            let assertion = new Results.AzuAssertionResult(AzuState.Passed, "message");
            assert.equal(assertion.getState(), AzuState.Passed);
            assert.equal(assertion.message, "message");
        });
    });
});

describe("AzuResourceResult", function() {
    describe("#constructor()", function() {
        it("should set properties from constructor", function() {
            let resource = new Results.AzuResourceResult("id", "name", 7);
            assert.equal(resource.id, "id");
            assert.equal(resource.name, "name");
            assert.equal(resource.assertions, 7);
        });
    });
});
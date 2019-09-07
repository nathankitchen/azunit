import "mocha";
import * as Results from "../../src/io/results";
import assert = require("assert");

describe("AzuTestResult", function() {
    describe("#constructor()", function() {
        it("should set properties from constructor", function() {
            let test = new Results.AzuTestResult("name");
            assert.equal(test.name, "name");
        });
    });
    describe("#getState()", function() {
        it("should return pass with single success assertion", function() {
            let test = new Results.AzuTestResult("name");
            let assertion = new Results.AzuAssertionResult(Results.AzuState.Passed, "message");
            test.assertions.push(assertion);
            assert.equal(test.getState(), Results.AzuState.Passed);
        });
        it("should return fail with single failed assertion", function() {
            let test = new Results.AzuTestResult("name");
            let assertion = new Results.AzuAssertionResult(Results.AzuState.Failed, "message");
            test.assertions.push(assertion);
            assert.equal(test.getState(), Results.AzuState.Failed);
        });
        it("should return fail with one success assertion and one fail assertion", function() {
            let test = new Results.AzuTestResult("name");
            let assertion1 = new Results.AzuAssertionResult(Results.AzuState.Failed, "message");
            let assertion2 = new Results.AzuAssertionResult(Results.AzuState.Passed, "message");
            test.assertions.push(assertion1);
            test.assertions.push(assertion2);
            assert.equal(test.getState(), Results.AzuState.Failed);
        });
    });
});

describe("AzuAssertionResult", function() {
    describe("#constructor()", function() {
        it("should set properties from constructor", function() {
            let assertion = new Results.AzuAssertionResult(Results.AzuState.Passed, "message");
            assert.equal(assertion.getState(), Results.AzuState.Passed);
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
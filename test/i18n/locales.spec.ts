import "mocha";
import assert = require("assert");
import * as Globalization from "../../src/i18n/locales";

describe("Culture", function() {
    describe("#enGb()", function() {
        it("returns English (British) language pack", function() {
            let locale = Globalization.Culture.enGb();
            assert.equal(locale != null, true);
        });
    });
});

describe("Resources", function() {
    describe("#clientError()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.clientError("error");
            assert.equal(message != null, true);
        });
    });
    describe("#clientText()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.clientText("text");
            assert.equal(message != null, true);
        });
    });
    describe("#clientTrace()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.clientTrace("trace");
            assert.equal(message != null, true);
        });
    });
    describe("#clientWarning()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.clientWarning("warning");
            assert.equal(message != null, true);
        });
    });
    describe("#completed()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.completed();
            assert.equal(message != null, true);
        });
    });
    describe("#endRunFailed()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.endRunFailed(10, 7, 3);
            assert.equal(message != null, true);
        });
    });
    describe("#endRunPassed()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.endRunPassed(10, 3);
            assert.equal(message != null, true);
        });
    });
    describe("#fatalError()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.fatalError(new Error("fail"));
            assert.equal(message != null, true);
        });
    });
    describe("#getAssertionDisabledFailureMessage()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.getAssertionDisabledFailureMessage("name", "resource", true);
            assert.equal(message != null, true);
        });
    });
    describe("#getAssertionDisabledSuccessMessage()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.getAssertionDisabledSuccessMessage("name", "resource", false);
            assert.equal(message != null, true);
        });
    });
    describe("#getAssertionEnabledFailureMessage()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.getAssertionEnabledFailureMessage("name", "resource", true);
            assert.equal(message != null, true);
        });
    });
    describe("#getAssertionEnabledSuccessMessage()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.getAssertionEnabledSuccessMessage("name", "resource", false);
            assert.equal(message != null, true);
        });
    });
    describe("#getAssertionEqualsFailureMessage()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.getAssertionEqualsFailureMessage("name", "resource", "A", "B");
            assert.equal(message != null, true);
        });
    });
    describe("#getAssertionEqualsSuccessMessage()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.getAssertionEqualsSuccessMessage("name", "resource", "A", "A");
            assert.equal(message != null, true);
        });
    });
    describe("#getAssertionResourceExistsFailMessage()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.getAssertionResourceExistsFailMessage("name", "resource", "A", "A");
            assert.equal(message != null, true);
        });
    });
    describe("#startGroup()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.startGroup("group", "source");
            assert.equal(message != null, true);
        });
    });
    describe("#startRun()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.startRun("run", "subscription");
            assert.equal(message != null, true);
        });
    });
    describe("#startTest()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.startTest("test");
            assert.equal(message != null, true);
        });
    });
    describe("#statusSubscription()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.statusSubscription("subscription");
            assert.equal(message != null, true);
        });
    });
    describe("#statusTenant()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.statusTenant("tenant");
            assert.equal(message != null, true);
        });
    });
    describe("#title()", function() {
        it("returns a message", function() {
            let message = Globalization.Resources.title("version");
            assert.equal(message != null, true);
        });
    });
});
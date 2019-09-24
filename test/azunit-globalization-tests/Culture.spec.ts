import "mocha";
import assert = require("assert");
import * as Globalization from "../../src/azunit-globalization";

describe("Culture", function() {
    describe("#enGb()", function() {
        it("returns English (British) language pack", function() {
            let locale = Globalization.Culture.enGb();
            assert.equal(locale != null, true);
        });
    });
    describe("#test()", function() {
        it("returns a test language pack", function() {
            let locale = Globalization.Culture.test();
            assert.equal(locale != null, true);
        });
    });
});
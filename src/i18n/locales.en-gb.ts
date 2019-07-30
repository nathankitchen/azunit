import { IAzuLocale } from "./locale";

export class AzuLocaleEnGb implements IAzuLocale {

    readonly test_status_pass: string = "PASSED";
    readonly test_status_fail: string = "FAILED";

    readonly title: string = "AZURE UNIT";
    readonly fatal_error: string = "{error} {message}";

    readonly status_tenant: string = "Authenticating with tenant {tenant}...";
    readonly status_subscription: string = "Attempting to download resources for subscription {subscription}...";
    readonly status_test: string = "{test}";
    
    readonly test_assertion_enabled_pass: string = `{name} on {resource} is enabled as expected (${this.test_status_pass}).`;
    readonly test_assertion_enabled_fail: string = `{name} on {resource} is not enabled as expected (${this.test_status_fail}).`;

    readonly test_assertion_disabled_pass: string = `{name} on {resource} is disabled as expected (${this.test_status_pass}).`;
    readonly test_assertion_disabled_fail: string = `{name} on {resource} is not disabled as expected (${this.test_status_fail}).`;

    readonly test_assertion_equals_pass: string = `{name} on {resource} equals {expected} (${this.test_status_pass}).`;
    readonly test_assertion_equals_fail: string = `{name} on {resource} should equal {expected} but found {actual} (${this.test_status_fail}).`
}
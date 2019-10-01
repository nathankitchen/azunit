import { IAzuLocale } from "./IAzuLocale"; 

export class AzuLocaleEnGb implements IAzuLocale {

    readonly test_status_pass: string = "PASSED";
    readonly test_status_fail: string = "FAILED";

    readonly title: string = "AzUnit";

    readonly msg_completed: string = "AzUnit completed successfully!";

    readonly fatal_error: string = "{error} {message}";

    readonly coverage: string = "Coverage: {percent}, ({count} of {total} resources)";

    readonly status_tenant: string = "Authenticating with tenant {tenant}...";
    readonly status_subscription: string = "Attempting to download resources for subscription {subscription}...";
    readonly start_run: string = "{run} on {subscription}";
    readonly start_group: string = "{group} from {source}";
    readonly start_test: string = "{test}";
    readonly end_run_passed: string = "Run succeeded with {tests} passing tests in {seconds} seconds.";
    readonly end_run_failed: string = "Run failed with {failures} failures of {total} tests in {seconds} seconds.";

    readonly resource_count: string = "Resource count";
    readonly selected_resources: string = "selected resources";
    readonly no_resources: string = "no resources";

    readonly test_assertion_enabled_pass: string = `{name} on {resource} is enabled as expected (${this.test_status_pass}).`;
    readonly test_assertion_enabled_fail: string = `{name} on {resource} is not enabled as expected (${this.test_status_fail}).`;

    readonly test_assertion_disabled_pass: string = `{name} on {resource} is disabled as expected (${this.test_status_pass}).`;
    readonly test_assertion_disabled_fail: string = `{name} on {resource} is not disabled as expected (${this.test_status_fail}).`;

    readonly test_assertion_equals_pass: string = `{name} on {resource} equals {expected} (${this.test_status_pass}).`;
    readonly test_assertion_equals_fail: string = `{name} on {resource} should equal {expected} but found {actual} (${this.test_status_fail}).`

    readonly test_assertion_contains_pass: string = `{name} on {resource} contains {expected} (${this.test_status_pass}).`;
    readonly test_assertion_contains_fail: string = `{name} on {resource} does not contain {expected}, it contains {actual} (${this.test_status_pass}).`;

    readonly test_assertion_gt_pass: string = `{name} on {resource} is {actual}, which is greater than {expected} (${this.test_status_pass}).`;
    readonly test_assertion_gt_fail: string = `{name} on {resource} is {actual}, which is not greater than {expected} (${this.test_status_pass}).`;
    readonly test_assertion_gte_pass: string = `{name} on {resource} is {actual}, which is greater than or equal to {expected} (${this.test_status_pass}).`;
    readonly test_assertion_gte_fail: string = `{name} on {resource} is {actual}, which is not greater than or equal to {expected} (${this.test_status_pass}).`;

    readonly test_assertion_lt_pass: string = `{name} on {resource} is {actual}, which is less than {expected} (${this.test_status_pass}).`;
    readonly test_assertion_lt_fail: string = `{name} on {resource} is {actual}, which is not less than {expected} (${this.test_status_pass}).`;
    readonly test_assertion_lte_pass: string = `{name} on {resource} is {actual}, which is less than or equal to {expected} (${this.test_status_pass}).`;
    readonly test_assertion_lte_fail: string = `{name} on {resource} is {actual}, which is not less than or equal to {expected} (${this.test_status_pass}).`;

    readonly dump_resource_complete: string = "{count} resources dumped to {file}.";
}
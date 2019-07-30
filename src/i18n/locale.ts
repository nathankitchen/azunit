export interface IAzuLocale {
    readonly test_status_pass: string;
    readonly test_status_fail: string;
    
    readonly title: string;

    readonly fatal_error: string;

    readonly status_tenant: string;
    readonly status_subscription: string;
    readonly status_test: string;

    readonly test_assertion_enabled_pass: string;
    readonly test_assertion_enabled_fail: string;

    readonly test_assertion_disabled_pass: string;
    readonly test_assertion_disabled_fail: string;

    readonly test_assertion_equals_pass: string;
    readonly test_assertion_equals_fail: string;
}
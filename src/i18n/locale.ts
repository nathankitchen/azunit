export interface IAzuLocale {
    readonly test_status_pass: string;
    readonly test_status_fail: string;
    
    readonly title: string;

    readonly msg_completed: string;

    readonly fatal_error: string;

    readonly coverage: string;

    readonly status_tenant: string;
    readonly status_subscription: string;
    readonly start_run: string;
    readonly start_group: string;
    readonly start_test: string;

    readonly resource_count: string;
    readonly selected_resources: string;
    readonly no_resources: string;

    readonly test_assertion_enabled_pass: string;
    readonly test_assertion_enabled_fail: string;

    readonly test_assertion_disabled_pass: string;
    readonly test_assertion_disabled_fail: string;

    readonly test_assertion_equals_pass: string;
    readonly test_assertion_equals_fail: string;

    readonly test_assertion_contains_pass: string;
    readonly test_assertion_contains_fail: string;

    readonly test_assertion_gt_pass: string;
    readonly test_assertion_gt_fail: string;
    readonly test_assertion_gte_pass: string;
    readonly test_assertion_gte_fail: string;

    readonly test_assertion_lt_pass: string;
    readonly test_assertion_lt_fail: string;
    readonly test_assertion_lte_pass: string;
    readonly test_assertion_lte_fail: string;
}
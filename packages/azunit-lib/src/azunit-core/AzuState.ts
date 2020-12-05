/**
 * Defines three states that a test can be in: passed, failed, or ignored.
 * Ignored is used for empty tests (no assertions) or if the test is marked
 * to be skipped.
 */
export enum AzuState {

    /* The test was ignored. */
    Ignored,

    /* The test evaluated as a success. */
    Passed,

    /* The test evaluated as failure. */
    Failed
}
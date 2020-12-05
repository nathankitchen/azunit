/* Defines states of test execution. */
export enum AzuExecution {

    /* Execution completed successfully. */
    Complete,
    
    /* Execution failed due to an error being thrown. */
    Error,

    /* Test execution timed out. */
    Timeout,

    /* Test script was invalid. */
    Invalid
}
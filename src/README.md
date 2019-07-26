# AzureUnit
A unit testing framework for Microsoft Azure resources, written in NodeJS and TypeScript.

## Usage


``` javascript
const azureUnit = require("azure-unit");
const azureUnitSuites = require("azure-unit-suites");

let runner = azureUnit.createTestRunner();

runner.useServicePrincipal("<tenant-name>", "<client-id>", "<secret>", (run) => {
    
    run.name = "Test";

    run.getSubscription("<subscription-id>", (subscription) => {

        subscription.test("Web Apps", (resources) => {

            var core = resources.selectByProvider("Microsoft/Apps");

            // Only expect one of these
            core.shouldHaveInstanceCount.equals(1); 
            
            // Test ARM properties using JsonPath in a fluent API. Each assertion
            // validates the selected resource.
            core.shouldHaveProperty("arrAffinity").as("Sticky Sessions").enabled(); 

            // You can mark each resource as "approved"; any "unapproved" resources
            // will be flagged in the result and will fail the test run.
            core.approve();

        });

        subscription.testSuite(azureUnitSuites.conventions.lowerCaseNames);
        subscription.testSuite(azureUnitSuites.noPublicResources);
        subscription.testSuite(azureUnitSuites.hasTag, { tag: "costCenter", values: [ "Finance", "Customer", "Overhead" ] });

    });
}).then(results =>
    // Do whatever you like to print/render the results
    azureUnit.printResults(results);
});
```

## Installation
``` cli
node install azure-unit
```

You will also need to create a Service Principal and assign it *Reader* permissions on the Azure Subscriptions you want to test. Full instructions can be found [here](https://github.com/Azure/azure-sdk-for-node/blob/master/Documentation/Authentication.md#service-principal-authentication).
# AzureUnit
A unit testing framework for Microsoft Azure resources, written in NodeJS and TypeScript. Designed to test any Azure cloud environment with ARM-based resources.

AzUnit authenticates with Azure and accesses a subscription, downloading the JSON ARM template defining each resource. It then finds the latest API version for the relevant provider and resource type, and uses it to download the full JSON definition for the resource.

Tests comprise a series of JsonPath-based assertions to validate the properties of the resources.

## WARNING
This framework is incomplete! It nominally "works", but it won't be useful until a few more features are added.

## Features (planned)

   - Run as a console application as part of a build process
   - Pre-packed configurable test blueprints covering common scenarios
   - Multilingual support
   - Run tests dynamically in a browser using interactive login

## Usage


``` javascript
const azureUnit = require("azunit");

let runner = azureUnit.createTestRunner();

runner.useServicePrincipal("<tenant-name>", "<client-id>", "<secret>", (run) => {
    
    run.name = "Test";

    run.getSubscription("<subscription-id>", (subscription) => {

        subscription.test("EU Search Service", (resources) => {

            var search = resources.selectByName("eu-search");

            // Test ARM properties using JsonPath in a fluent API. Each assertion
            // is run against the selected resource(s).
            search.shouldHaveProperty("$.location").as("Location").equals("West Europe");
            search.shouldHaveProperty("$.sku.name").as("Service Tier").equals("basic");
            
            // You can mark each resource as "approved"; any "unapproved" resources
            // will be flagged in the result and will fail the test run.
            // (NB: Doesn't actually do that yet)
            search.approve("Has been scanned");

        });

        subscription.selectUnapproved().approve("Anything goes in this subscription!");
    });

}).then((result)=> {

    console.log('Completed!');

    if (!result.isSuccess()) {
        process.exitCode = 1;
    }

}).catch((err) => {
    console.log('Failed');
    console.error(err);
    process.exitCode = 1;
});
```

When creating tests, a productive workflow is often to sign in to Microsoft [Resource Explorer](https://resources.azure.com) and navigate to the resources you want to test. Find the properties you are interested in, and write tests to validate them.

## Installation
First, create yourself a directory with a nice name, like `<environment>-azunit`. Navigate to it and run:

``` cli
npm install azunit
```

Next, you will need to create a Service Principal and assign it *Reader* permissions on the Azure Subscription(s) that you want to test. Full instructions can be found [here](https://github.com/Azure/azure-sdk-for-node/blob/master/Documentation/Authentication.md#service-principal-authentication).

## Contributing


   1. Fork it!
   2. Create your feature branch: `git checkout -b my-new-feature`
   3. Commit your changes: `git commit -am 'Add some feature'`
   4. Push to the branch: `git push origin my-new-feature`
   5. Submit a pull request :D

## Credits

Developer - Nathan Kitchen (@nathankitchen)

## License
 
The MIT License (MIT)

Copyright (c) 2019 Nathan Kitchen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
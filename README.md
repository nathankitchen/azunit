# AzureUnit
A unit testing framework for Microsoft Azure resources, written in NodeJS and TypeScript. Designed to test any Azure cloud environment with ARM-based resources.

AzUnit authenticates with Azure and accesses a subscription, downloading the JSON ARM template defining each resource. It then finds the latest API version for the relevant provider and resource type, and uses it to download the full JSON definition for the resource.

Tests comprise a series of JsonPath-based assertions to validate the properties of the resources. Code coverage is pretty dumb: it works by tracking which resources have had assertions run against them, and spitting out the coverage level as a percentage.

## WARNING
This framework is incomplete! It nominally "works", but it won't be useful until a few more features are added.

## Feature roadmap

   - Run as a command line application (**DONE**)
   - Output results in multiple formats, including:
      - XML (**DONE**)
      - CSV (**DONE**)
      - JSON (**DONE**)
      - Markdown (**DONE**)
      - HTML (**DONE**)
   - "Code coverage" (resources asserted vs total resources) (**DONE**)
   - Pre-packed configurable test blueprints covering common scenarios
   - Multilingual support
   - Run tests dynamically in a browser using interactive login

The output result formats are still being stabilised: expect change to the structures.

## Quickstart
First, install AzUnit using NPM (do not use @latest):

``` cli
npm install -g azunit@prerelease
```

Then create some JS files to run the tests. Call the global function `test` passing a test title, and provide a function to test resources. When creating tests, a productive workflow is often to sign in to Microsoft [Resource Explorer](https://resources.azure.com) and navigate to the resources you want to test. Find the properties you are interested in, and write tests to validate them.

``` javascript
title("website.com");

start("Search Service", (test) => {

    var search = test.selectResourcesByName("someservice");

    search.shouldHaveInstanceCount.equals(1);

    // Test ARM properties using JsonPath in a fluent API. Each assertion
    // is run against the selected resource(s).
    search.shouldHaveProperty("$.location").as("Location").equals("West Europe");
    search.shouldHaveProperty("$.sku.name").as("Service Tier").equals("basic");

    var storage = resources.selectResourcesByName("nk1b1234a2d3401x46fee9aa");
    storage.shouldHaveProperty("$.properties.encryption.services.file.enabled").as("File encryption").disabled();
});
```

Next you will need to create a Service Principal and assign it *Reader* permissions on the Azure Subscription(s) that you want to test. Full instructions can be found [here](https://github.com/Azure/azure-sdk-for-node/blob/master/Documentation/Authentication.md#service-principal-authentication).

Finally, run AzUnit from shell passing details of the Service Principal, Tenant, and Subscrpition as parameters. You can call AzUnit multiple times for each environment you want to test.

``` cli
azunit run ./samples/quickstart/test.js \
        --tenant acme.onmicrosoft.com \
        --subscription ffffffff-ffff-ffff-ffff-ffffffffffff \
        --app-id ffffffff-ffff-ffff-ffff-ffffffffffff \
        --app-key [key] \
        --output-xml .azunit/test.xml \
        --run-name "My glorious test run"
```

This will result in output similar to that shown below:

![Console output of an AzUnit run](docs/output.png?raw=true)

## Commands
AzUnit can be passed multiple commands, each of which has its own parameters. At present, only the `run` command is implemented.

### run
Runs the specified tests against the named environment. Multiple test files can be included.

``` cli
azunit run ./test1.js ./test2.js [parameters]
```

| Parameter      | Alias | Description                                                              | Default         |
|----------------|-------|--------------------------------------------------------------------------|-----------------|
| --tenant       | -t    | String. The domain name of the tenant, often ends in ".onmicrosoft.com". | None            |
| --app-id       | -a    | GUID. The service principal with access to the target subscription.      | None            |
| --app-key      | -k    | String. The secret for the service principal.                            | None            |
| --subscription | -s    | GUID. The ID of the subscription containing resources to tests.          | None            |
| --run-culture  | -c    | Language code. Culture/language code for messages in the run. *          | en-GB           |
| --run-name     | -n    | String. A name for the test run.                                         | *Current date*  |
| --parameters   | -p    | String. Path to a file containing JSON data to be passed to test files.  | None            |
| --silent       | -x    | No value required: prevents logging test result output to the console.   | N/A             |
| --output-xml   | -X    | String. A filename to output the results of the run in XML format.       | *Based on date* |
| --output-json  | -J    | String. A filename to output the results of the run in JSON format.      | *Based on date* |
| --output-html  | -H    | String. A filename to output the results of the run in HTML format.      | *Based on date* |
| --output-md    | -M    | String. A filename to output the results of the run in Markdown format.  | *Based on date* |
| --output-csv   | -C    | String. A filename to output the results of the run in CSV format.       | *Based on date* |

&ast; *Run culture is currently ignored as the output only runs in a single culture: enGb*

To use parameters, create a file containing a JSON data structure that you want to make available to your tests. For example, create `env-test.params.json` containing:

``` javascript
{
    "prefix": "tst"
}
```

You can use this parameter within your tests as follows (parameters will be in the global context):

``` javascript
start("Search Service", (test) => { 
    test.log.write(parameters.prefix);
});
```

This allows tests to be configured and reused across multiple environments.

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
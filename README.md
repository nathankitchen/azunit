# AzureUnit
[![Build Status](https://travis-ci.com/nathankitchen/azunit.svg?branch=master)](https://travis-ci.com/nathankitchen/azunit)

A unit testing framework for Microsoft Azure resources, written in NodeJS and TypeScript. Designed to test any Azure cloud environment with ARM-based resources.

AzUnit authenticates with Azure and accesses a subscription, downloading the JSON ARM template defining each resource. It then finds the latest API version for the relevant provider and resource type, and uses it to download the full JSON definition for the resource.

Tests comprise a series of JsonPath-based assertions to validate the properties of the resources. Code coverage tracks which resources have assertions run against them, and provides coverage level as a percentage.

For feature roadmaps, please refer to the GitHub projects associated with this repository.

## Quickstart
First, install AzUnit using NPM:

``` cli
npm install -g azunit
```

Then, navigate to an empty directory and run:

``` cli
azunit init
```

This will populate a sample project structure; refer to the command reference for further information.

Then create some JS files to run the tests. Call the global function `start` passing a test title, and provide a function to test your resources. When creating tests, a productive workflow is often to sign in to Microsoft [Resource Explorer](https://resources.azure.com) and navigate to the resources you want to test. Find the properties you are interested in, and write tests to validate them.

``` javascript
title("website.com");

start("Search Service", (test) => {

    var search = test.selectResourcesByName("someservice");

    search.shouldHaveInstanceCount.equals(1);

    // Test ARM properties using JsonPath in a fluent API. Each assertion
    // is run against the selected resource(s).
    search.shouldHaveProperty("$.location").as("Location").equals("West Europe");
    search.shouldHaveProperty("$.sku.name").as("Service Tier").equals("basic");

    test.log.trace("An example trace message");
    test.log.write("An example log message");
    test.log.warning("An example warning message");
    test.log.error("An example error message");

    var storage = test.selectResourcesByName("nk1b1234a2d3401x46fee9aa");
    storage.shouldHaveProperty("$.properties.encryption.services.file.enabled").as("File encryption").disabled();
});
```

To run your test you will need to create a Service Principal and assign it *Reader* permissions on the Azure Subscription(s) that you want to test. Full instructions can be found [here](https://github.com/Azure/azure-sdk-for-node/blob/master/Documentation/Authentication.md#service-principal-authentication).

Finally, run AzUnit from shell passing details of the Service Principal, Tenant, and Subscrpition as parameters. You can call AzUnit multiple times for each environment you want to test. There are two options for calling AzUnit: `test` or `run`.

### Test mode
Intended for use in terminal and allowing quick runs against different environments.

``` cli
azunit test ./samples/quickstart/test.js \
        --tenant acme.onmicrosoft.com \
        --subscription ffffffff-ffff-ffff-ffff-ffffffffffff \
        --app-id ffffffff-ffff-ffff-ffff-ffffffffffff \
        --app-key [key] \
        --output-xml .azunit/test.xml \
        --run-name "My glorious test run"
```

### Run mode
Leverage YAML file configuration to pass the same configuration in a more reusable way, suitable for sharing with a wider team.

``` YML
run:
  name          : Web farm tests
  select        : ./samples/quickstart/*.js
  parameters    : ./samples/quickstart/test.params.json
  language      : enGb
  silent        : false
auth:
  tenant        : $TENANT
  appId         : $APP_ID
  appKey        : $APP_KEY
  subscription  : $SUBSCRIPTION
coverage:
  resources:
    threshold   : 90
    fail        : true
  APR:
    threshold   : 1
    fail        : true
  AAPR:
    threshold   : 1.2
    fail        : true
output:
  json          : .azunit/output.json
  xml           : .azunit/output.xml
```

Settings in the YAML file are as follows:

|===================|====================================================|
| Setting           | Description                                        |
|===================|====================================================|
| run/name          | A descriptive title for the run.                   |
| run/select        | Glob for defining test JS files to process.        |
| run/parameters    | JSON data passed to JS files to enable test reuse. |
| run/language      | Language. Only enGb is currently supported.        |
| run/silent        | Suppress console output (secure build scenarios?)  |
| auth/tenant       | The tenant ID for the target subscription.         |
| auth/appId        | The app ID with access to the subscription.        |
| auth/appKey       | The app key to utilise this application.           |
| auth/subscription | The subscription ID.                               |
| output/json       | Path to store run results (in JSON format).        |
| output/xml        | Path to store run results (in XML format).         |

*Note: All values starting with `$` will be treated as environment variables and loaded appropriately. To avoid putting sensitive information in config files (which should be source controlled), set this information in local environment variables (on your dev machine or build pipeline) and reference the variable with the $ prefix (e.g. `appKey: $KEY`)*

Finally, run AzUnit from your shell passing the configuration file as a parameter:

``` cli
azunit run --config azunit.dev.yml
```

This will result in output similar to that shown below:

![Console output of an AzUnit run](docs/output.png?raw=true)

## Commands
AzUnit can be passed multiple commands, each of which has its own parameters.

### init
Initialises a project in the current directory.

``` cli
azunit init
```

The capability of init is reasonably limited at the moment: it simply creates files if they don't already exist, so it won't try to merge new additions to your .gitignore. Rather than running `azunit init` in an existing directory, I recommend doing it in a clean one and then merging the relevant settings.

After running `azunit init`, set up your environment with [Service Principal Authentication](https://github.com/Azure/azure-sdk-for-node/blob/master/Documentation/Authentication.md#service-principal-authentication), adding your settings to the `.env` file or using actual environment variables on your machine.

### run
Runs AzUnit with options configured in the specified YAML file.

``` cli
azunit run --config azunit.yml
```

| Parameter      | Alias | Description                                                              | Default         |
|----------------|-------|--------------------------------------------------------------------------|-----------------|
| --config       | -c    | String. Path to the YAML config file describing the environment.         | None            |

### test
A command to enable AzUnit to run without YAML file configuration, executing the specified tests against the named environment. Multiple test files can be included and there are a reasonable number of options, but you don't get the extensive control of things like test coverage that you would get with a YAML config input.

``` cli
azunit test ./test1.js ./test2.js [parameters]
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

### dump
This is a development tool that dumps an array of all the resources under test in a subscription. It can be used for debugging if particular JsonPath queries don't seem to be evaluating correctly, by dropping what AzUnit "sees" into a handy file for reference.

``` cli
azunit dump --config azunit.yml --output dump.json
```

| Parameter      | Alias | Description                                                              | Default         |
|----------------|-------|--------------------------------------------------------------------------|-----------------|
| --config       | -c    | String. Path to the YAML config file describing the environment.         | None            |
| --output       | -o    | String. Name of a file to dump resource output to.                       | None            |

## Output formats
Initially the project included output formats for CSV, HTML, and Markdown. These have been removed for several reasons:

   1. They required an amount of unnecessary package bloat
   2. Many decisions around formatting were arbitrary and probably wouldn't properly serve use cases
   3. Formatting outputs can be customised in test post-processing, for example:
        - Running XSLT over the output from PowerShell
        - Dropping into gulp
        - Utilising a templating framework like Handlebars or Liquid

Samples of transforms that can serve as a basis for different projects can be found in `samples/transforms`. Feel free to contribute new ones via a pull request, so long as they're generic, self-contained, and reasonably unique I'll be happy to include them.

## Contributing

   1. Fork it!
   2. Create your feature branch: `git checkout -b my-new-feature`
   3. Commit your changes: `git commit -am 'Add some feature'`
   4. Push to the branch: `git push origin my-new-feature`
   5. Submit a pull request :D

## Credits

Developer - Nathan Kitchen (@nathankitchen)

## License
This project is Open Source and licensed under [MIT](license.md).
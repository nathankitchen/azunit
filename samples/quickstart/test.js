title("Quickstart 101");

start("Search Service", (test) => {

    test.title = "";
    test.description = "";
    test.categories.push("");
    test.ignore = true;

    test.log.write(parameters.nathan);

    var search = test.selectResourcesByName("cloudskus");

    search.shouldHaveInstanceCount.equals(1);

    // Test ARM properties using JsonPath in a fluent API. Each assertion
    // is run against the selected resource(s).
    search.shouldHaveProperty("$.location").as("Location").equals("West Europe");
    search.shouldHaveProperty("$.sku.name").as("Service Tier").equals("basic");

    var storage = test.selectResourcesByName("commands");
    storage.shouldHaveInstanceCount.equals(0);

    storage.shouldHaveProperty("$.properties.encryption.services.file.enabled").as("File encryption").disabled();
});

start("Search Service2", (test) => {

    test.title = "";
    test.description = "";
    test.categories.push("");
    test.ignore = true;

    var search = test.selectResourcesByName("cloudskus");

    search.shouldHaveInstanceCount.equals(1);

    // Test ARM properties using JsonPath in a fluent API. Each assertion
    // is run against the selected resource(s).
    search.shouldHaveProperty("$.location").as("Location").equals("West Europe");
    search.shouldHaveProperty("$.sku.name").as("Service Tier").equals("basic");

    var storage = test.selectResourcesByName("commands");
    storage.shouldHaveInstanceCount.equals(0);

    storage.shouldHaveProperty("$.properties.encryption.services.file.enabled").as("File encryption").disabled();
});

// run("./test/second.js", "WHAT?", { ps: 1 } );
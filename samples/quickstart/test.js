title("Quickstart 101");

test("Search Service", (resources) => {

    var search = resources.selectByName("someresource");

    search.shouldHaveInstanceCount.equals(1);

    // Test ARM properties using JsonPath in a fluent API. Each assertion
    // is run against the selected resource(s).
    search.shouldHaveProperty("$.location").as("Location").equals("West Europe");
    search.shouldHaveProperty("$.sku.name").as("Service Tier").equals("basic");

    var storage = resources.selectByName("commands");
    storage.shouldHaveProperty("$.properties.encryption.services.file.enabled").as("File encryption").disabled();
});
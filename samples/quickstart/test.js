title("Quickstart 101");

test("Search Service", (resources) => {

    var search = resources.selectByName("acme");

    search.shouldHaveInstanceCount.equals(1);

    // Test ARM properties using JsonPath in a fluent API. Each assertion
    // is run against the selected resource(s).
    search.shouldHaveProperty("$.location").as("Location").equals("West Europe");
    search.shouldHaveProperty("$.sku.name").as("Service Tier").equals("basic");

    

    var storage = resources.selectByName("commands");
    storage.shouldHaveInstanceCount.equals(0);

    storage.shouldHaveProperty("$.properties.encryption.services.file.enabled").as("File encryption").enabled();
});
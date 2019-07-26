[
    {
        name: "KeyVault Piles",
        test: (resources, config) => {
            var core = resources.selectByName("name");

            core.shouldHaveProperty("$.location").as("Location").equals(config.logging.region);
            core.shouldHaveProperty("$.properties.accessTier").as("Access Tier").equals(config.logging.storageTier);
            core.approve();
        }
    }
]
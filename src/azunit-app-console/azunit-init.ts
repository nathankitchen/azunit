import program from "commander";
import fs from "fs";

program
    .parse(process.argv);

const envFilename = ".env";
const gitFilename = ".gitignore";
const yamlFilename = "azunit.yml";
const azureFilename = "src/azuredeploy.json";
const azureParamsFilename = "src/azuredeploy.parameters.json";
const paramsFilename = "test/parameters.json";
const testFilename = "test/test.js";

fs.exists(envFilename, (exists) => {
    if (!exists) {
        let ws = fs.createWriteStream(envFilename);
        ws.write("TENANT=tenant.onmicrosoft.com\n");
        ws.write("APP_ID=ffffffff-ffff-ffff-ffff-ffffffffffff\n");
        ws.write("APP_KEY=00000000000000000000000000000000\n");
        ws.write("SUBSCRIPTION=ffffffff-ffff-ffff-ffff-ffffffffffff\n");
        ws.close();
    }
});

fs.exists(gitFilename, (exists) => {
    if (!exists) {
        let ws = fs.createWriteStream(gitFilename);

        try {
            ws.write("### AzUnit\n");
            ws.write("/.azunit\n");
            ws.write(".env\n");
        }
        finally {
            ws.close();
        }
    }
});


fs.exists(yamlFilename, (exists) => {
    if (!exists) {
        let ws = fs.createWriteStream(yamlFilename);

        try {
            ws.write("---\n");
            ws.write("run:\n");
            ws.write("  name          : My glorious test run\n");
            ws.write("  select        : ./test/*.js\n");
            ws.write("  parameters    : ./test/parameters.json\n");
            ws.write("  language      : enGb\n");
            ws.write("  silent        : false\n");
            ws.write("auth:\n");
            ws.write("  tenant        : $TENANT\n");
            ws.write("  appId         : $APP_ID\n");
            ws.write("  appKey        : $APP_KEY\n");
            ws.write("  subscription  : $SUBSCRIPTION\n");
            ws.write("coverage:\n");
            ws.write("  resources:\n");
            ws.write("    threshold   : 90\n");
            ws.write("    fail        : true\n");
            ws.write("  APR:\n");
            ws.write("    threshold   : 1\n");
            ws.write("    fail        : true\n");
            ws.write("  AAPR:\n");
            ws.write("    threshold   : 1.2\n");
            ws.write("    fail        : true\n");
            ws.write("output:\n");
            ws.write("  json          : ./.azunit/output.json\n");
            ws.write("  xml           : ./.azunit/output.xml\n");
        }
        finally {
            ws.close();
        }
    }
});

fs.mkdir(".azunit", (err) => {});
fs.mkdir("src", (err) => {
    // /src/azuredeploy.json file
    fs.exists(azureFilename, (exists) => {
        if (!exists) {
            let ws = fs.createWriteStream(azureFilename);
    
            try {
                ws.write(JSON.stringify({}));
            }
            finally {
                ws.close();
            }
        }
    });

    // /src/azuredeploy.parameters.json file
    fs.exists(azureParamsFilename, (exists) => {
        if (!exists) {
            let ws = fs.createWriteStream(azureParamsFilename);
    
            try {
                ws.write(JSON.stringify({}));
            }
            finally {
                ws.close();
            }
        }
    });
});

// /test/ directory
fs.mkdir("test", (err) => {

    // /test/parameters.json file
    fs.exists(paramsFilename, (exists) => {
        if (!exists) {
            let ws = fs.createWriteStream(paramsFilename);
    
            try {
                ws.write(JSON.stringify({ "hello": "world" }));
            }
            finally {
                ws.close();
            }
        }
    });

    // /test/test.js file
    fs.exists(testFilename, (exists) => {
        if (!exists) {
            let ws = fs.createWriteStream(testFilename);
    
            try {
                ws.write("title(\"Sample test\");\n");
                ws.write("\n");
                ws.write("start(\"My first test\", (test) => {\n");
                ws.write("\ttest.log.write(\"hello\" + parameters.hello);")
                ws.write("\n");
                ws.write("\tvar resources = test.selectResourcesByName(\"resourceName\");\n");
                ws.write("\n");
                ws.write("\tresources.shouldHaveInstanceCount.equals(0);\n");
                ws.write("});\n");
            }
            finally {
                ws.close();
            }
        }
    });

});
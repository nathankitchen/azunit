#!/usr/bin/env node
"use strict";

import program from "commander";
import pkg = require("../../package.json");
var dotenv = require("dotenv");

dotenv.config();

program
    .name(pkg.name)
    .version(pkg.version)
    .description(pkg.description)
    .command("init", "Initialises a test project").alias("i")
    .command("dump", "Dumps all resource data for debugging").alias("d")
    .command("cli <tests>", "Runs tests with command line arguments").alias("c")
    .command("run <projects>", "Runs a test project from YAML config").alias("r")
    .parse(process.argv);
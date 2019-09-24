#!/usr/bin/env node
'use strict';

import program from 'commander';
import pkg = require('../../package.json');

program
    .name(pkg.name)
    .version(pkg.version)
    .description(pkg.description)
    .command('run <tests>','Runs the specified tests').alias('r')
    .command('project','Runs the specified project').alias('p')
    .parse(process.argv);
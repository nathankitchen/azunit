import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

console.log("hh");
let taskPath = path.join(__dirname, '..', 'src', 'index.js');
console.log(taskPath);
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('config', '../../samples/project/azunit.yml');

tmr.run();
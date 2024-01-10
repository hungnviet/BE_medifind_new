//import { PythonShell } from 'python-shell';
process.env.PYTHONIOENCODING = 'utf-8';
const { PythonShell } = require('python-shell');
PythonShell.run('./NLP/extract.py', null, function (err, result) {
  if (err) throw err;
  // result is an array consisting of messages collected during execution
  console.log('result: ', result.toString());
});
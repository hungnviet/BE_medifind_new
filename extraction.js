import { PythonShell } from 'python-shell';

PythonShell.run('extraction.py', null, function (err, result) {
  if (err) throw err;
  // result is an array consisting of messages collected during execution
  console.log('result: ', result.toString());
});
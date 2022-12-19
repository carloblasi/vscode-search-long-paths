const { readFileSync } = require('fs');
const { basename, join } = require('path');
const { exit } = require('process');
const { parentPort } = require('worker_threads');

// Receive message from the parent
parentPort.on('message', ({ files, str, folder }) => {
  // Send result back to parent

  const matched = [];

  // console.log('searching ' + files.length);

  files.forEach((file) => {
    const content = readFileSync(join(folder, file));
    if (content.toString().toLowerCase().indexOf(str.toLowerCase()) >= 0) {
      // parentPort.postMessage('match: ' + file);
      matched.push({
        path: file,
        label: basename(file),
        isSelected: false,
        file: join(folder, file),
      });
    }
  });

  parentPort.postMessage(matched);
  exit(0);
});

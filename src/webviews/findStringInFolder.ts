import { sync as globbySync } from 'globby';
import * as os from 'os';
import { dirname } from 'path';
import { Observable } from 'rxjs';
import { Worker } from 'worker_threads';
import { File } from './models';

function sliceIntoChunks(arr: any[], chunkSize: number): any[][] {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

export function findStringInFolder(str: string, include: string, exclude: string, folder: string): Observable<File[]> {
  return new Observable((subscriber) => {
    console.log({ str, include, exclude });
    if (!str.trim()) {
      subscriber.next([]);
      subscriber.complete();
      return;
    }

    // const defaultExclude = workspace.getConfiguration().get<any>('search.exclude');

    const includePatterns = include ? include.split(',') : ['**/*'];
    const excludePatterns = exclude ? exclude.split(',') : ['**/dist/**', '**/node_modules/**'];
    const patterns = [...includePatterns, ...excludePatterns.map((e) => '!' + e)];

    const files = globbySync(patterns, { cwd: folder, onlyFiles: true, gitignore: true });

    let matched: File[] = [];

    const filesChunks: string[][] = sliceIntoChunks(files, Math.floor(files.length / (os.cpus().length - 1)));

    if (filesChunks.length === 0) {
      subscriber.next([]);
      subscriber.complete();
    }

    let i = 0;

    const workers: Worker[] = [];

    filesChunks.forEach((files) => {
      try {
        i++;
        const worker = new Worker(
          `
          const { readFileSync } = require('fs');
          const { basename, join } = require('path');
          const { exit } = require('process');
          const { parentPort } = require('worker_threads');
          
          // Receive message from the parent
          parentPort.on('message', ({ files, str, folder }) => {
            // Send result back to parent
          
            const matched = [];
                  
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
        `,
          { eval: true }
        );
        worker.postMessage({ files, folder, str: str.trim() });

        worker.on('message', (m) => {
          matched = matched.concat(m);
        });

        worker.on('error', (err) => {
          subscriber.error(err);
        });

        worker.on('exit', (code) => {
          i--;
          if (i <= 0) {
            subscriber.next(matched.sort((a, b) => dirname(a.path).localeCompare(dirname(b.path))));
            subscriber.complete();
          }
        });
        workers.push(worker);
      } catch (err: any) {
        subscriber.error(err);
      }
    });

    return () => {
      return Promise.all(
        workers.map((w, i) => {
          w.removeAllListeners();
          return w.terminate().catch((err) => {
            return Promise.resolve();
          });
        })
      );
    };
  });
}

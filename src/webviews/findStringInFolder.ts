import * as os from 'os';
import { dirname } from 'path';
import { Observable } from 'rxjs';
import { Worker } from 'worker_threads';
import { File } from './models';
import { fdir } from 'fdir';
import { isMatch } from 'picomatch';

function sliceIntoChunks(arr: any[], chunkSize: number): any[][] {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

// prettier-ignore
function filter<T>(array: T[], fn: (a: T) => boolean) {
  let result = [], i, len = array.length;
  for (i = 0; i < len; i++) {
    if (fn(array[i])) result.push(array[i]);
  }
  return result;
}

export function invalidateCachedFiles() {
  cachedFiles = null;
}

const DEFAULT_INCLUDE = ['**'];
const DEFAULT_EXCLUDE = ['dist/**', '**/dist/**', 'node_modules/**', '**/node_modules/**', '.git/**'];
const coresNumber = os.cpus().length;
let cachedFiles: string[] | null = null;

export function findStringInFolder(str: string, include: string, exclude: string, folder: string): Observable<File[]> {
  return new Observable((subscriber) => {
    if (!str.trim()) {
      subscriber.next([]);
      subscriber.complete();
      return;
    }

    // const defaultExclude = workspace.getConfiguration().get<any>('search.exclude');
    let removePendingListenersOnUnsubscribe = () => {};

    let findFiles = Promise.resolve(cachedFiles);
    if (!cachedFiles) {
      findFiles = new fdir().withRelativePaths().crawl(folder).withPromise() as Promise<string[]>;
    }

    const workers: Worker[] = [];

    findFiles
      .then((files) => {
        const includePatterns = include ? include.split('\\').join('/').split(',') : DEFAULT_INCLUDE;
        const excludePatterns = exclude ? exclude.split('\\').join('/').split(',') : DEFAULT_EXCLUDE;
        cachedFiles = filter(files as string[], (path) => isMatch(path, includePatterns, { ignore: excludePatterns }));

        if (cachedFiles.length === 0) {
          subscriber.next([]);
          subscriber.complete();
        }

        const chunkSize = Math.ceil(cachedFiles.length / coresNumber - 1);
        const filesChunks: string[][] = sliceIntoChunks(cachedFiles, chunkSize);
        const matched: File[] = [];

        let i = filesChunks.length;

        const onMessage = (m: string | File[]) => {
          // console.log('messaggio arrivato da worker ' + workerIndex);

          if (m === 'EXIT') {
            i -= 1;
            if (i === 0) {
              subscriber.next(matched.sort((a, b) => dirname(a.path).localeCompare(dirname(b.path))));
              subscriber.complete();
            }
          } else {
            // console.log('worker finished')
            matched.push(...(m as File[]));
          }
        };

        const onError = (err: Error) => {
          console.log(err);
          subscriber.error(err);
        };

        removePendingListenersOnUnsubscribe = () => {
          workers.forEach((worker) => {
            worker.removeListener('message', onMessage);
            worker.removeListener('error', onError);
          });
        };

        filesChunks.forEach((chunk) => {
          const worker = new Worker(
            `
const { readFileSync } = require("fs");
const { basename, sep } = require("path");
const { parentPort } = require("worker_threads");

parentPort.addListener("message", (message) => {
if (message.action === "SEARCH") {
  let { files, str, folder } = message.payload;
  let i,
    len,
    matched = [],
    strLowerCase = str.toLowerCase();

  for (i = 0, len = files.length; i < len; i++) {
    const file = files[i];
    const path = folder + sep + file;
    const content = readFileSync(path, { encoding: "utf-8" });
    if (content.toLowerCase().indexOf(strLowerCase) !== -1) {
      matched.push({
        path: file,
        label: basename(file),
        isSelected: false,
        file: path,
      });
    }
  }

  parentPort.postMessage(matched);
  parentPort.postMessage("EXIT");
}
});`,
            { eval: true }
          );

          worker.addListener('message', onMessage);
          worker.addListener('error', onError);
          worker.postMessage({
            action: 'SEARCH',
            payload: { files: chunk, folder, str: str.trim() },
          });
          workers.push(worker);
        });
      })
      .catch((err) => {
        subscriber.error(err);
      });

    return () => {
      removePendingListenersOnUnsubscribe();
      return Promise.all(
        workers.map((worker) => {
          return worker.terminate();
        })
      );
    };
  });
}

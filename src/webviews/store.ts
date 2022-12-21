import * as os from 'os';
import { Subject } from 'rxjs';
import * as vscode from 'vscode';
import { CONFIG_FOLDER } from '../constants/config';
import { findStringInFolder } from './findStringInFolder';
import { File, WorkspaceState } from './models';

const onUpdate = new Subject<void>();

export const store = {
  state: 'list',
  visibleFiles: [],
  error: '',
  search: '',
  include: '',
  exclude: '',
  selected: !!vscode.workspace.workspaceFile ? vscode.workspace.workspaceFile.fsPath : '',
  dispatch(fn: any) {
    onUpdate.next();
  },
  onUpdate,
} as WorkspaceState;

export const setSearchTerm = (value: string, include: string, exclude: string): Promise<File[]> => {
  return new Promise<File[]>((resolve) => {
    store.search = value;
    store.include = include;
    store.exclude = exclude;

    const conf = vscode.workspace.getConfiguration();
    const folder: string = conf.get('searchLongPaths.folder') || CONFIG_FOLDER;
    const homeDir = os.homedir();
    const baseFolder = folder ? folder.replace(`~`, homeDir) : homeDir;

    if (baseFolder === undefined) {
      console.log('Open a folder first');
      resolve([]);
    }

    findStringInFolder(value, include, exclude, baseFolder).subscribe({
      next: (matched) => {
        resolve(matched);
      },
      error: (error) => {
        console.error(error);
        resolve([]);
      },
    });
  });
};

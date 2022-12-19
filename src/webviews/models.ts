/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { Subject } from 'rxjs';

export interface File {
  file: string;
  isSelected: boolean;
  label: string;
  path: string;
}

export type WorkspaceErrors = '' | 'FETCH';

export enum Actions {
  FOCUS_SEARCH = 'FOCUS_SEARCH',
  OPEN_CUR_WINDOW = 'OPEN_CUR_WINDOW',
  OPEN_NEW_WINDOW = 'OPEN_NEW_WINDOW',
  SEARCH = 'SEARCH',
  SHOW_SETTINGS = 'SHOW_SETTINGS',
  OPEN_IN_EDITOR = 'OPEN_IN_EDITOR',
}

export type WorkspaceState = {
  error: WorkspaceErrors;
  search: string;
  include: string;
  exclude: string;
  selected: string;
  state: 'error' | 'invalid' | 'list' | 'loading';
  visibleFiles: File[];
  onUpdate: Subject<void>;
  dispatch: (fn?: any) => void;
};

export interface RenderVars {
  imgDarkFolderUri: vscode.Uri;
  imgLightFolderUri: vscode.Uri;
}

export interface TemplateVars {
  cspSource: string;
  cssFolderUri: vscode.Uri;
  imgDarkFolderUri: vscode.Uri;
  imgLightFolderUri: vscode.Uri;
  nonce: string;
  scriptFolderUri: vscode.Uri;
  title: string;
  styleUri: vscode.Uri;
  codiconsUri: vscode.Uri;
}

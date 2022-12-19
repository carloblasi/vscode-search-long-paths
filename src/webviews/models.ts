/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { PayloadAction } from '@reduxjs/toolkit';
import { Subject } from 'rxjs';
import { SortIds } from '../registerCommands';

export interface File {
  file: string;
  isSelected: boolean;
  label: string;
  path: string;
}

export type Files = File[];

export type WorkspaceErrors = '' | 'FETCH';

export enum WorkspacePmActions {
  FOCUS_SEARCH = 'FOCUS_SEARCH',
  OPEN_CUR_WINDOW = 'OPEN_CUR_WINDOW',
  OPEN_NEW_WINDOW = 'OPEN_NEW_WINDOW',
  SEARCH = 'SEARCH',
  SHOW_SETTINGS = 'SHOW_SETTINGS',
  OPEN_IN_EDITOR = 'OPEN_IN_EDITOR',
}

export type WorkspacePmPayload = string;
export interface WorkspacePersistedState {
  sort: SortIds;
}
export type WorkspacePmPayloadSearchTerm = string;

export type WorkspaceState = {
  convertedFiles: Files;
  error: WorkspaceErrors;
  files: WorkspaceFiles;
  isFolderInvalid: boolean;
  search: string;
  include: string;
  exclude: string;
  selected: string;
  sort: SortIds;
  state: WorkspaceStates;
  visibleFiles: Files;
  onUpdate: Subject<void>;
  dispatch: (fn?: any) => void;
};

export type WorkspaceStates = 'error' | 'invalid' | 'list' | 'loading';
export type WsFiles = any;
export type WorkspaceFiles = false | WsFiles;

export type WorkspaceThunkAction<Payload> = PayloadAction<
  Payload,
  string,
  {
    arg: void | string;
    requestId: string;
    requestStatus: 'fulfilled';
  },
  never
>;

export interface PostMessage<Payload, Actions> {
  action: Actions;
  payload: Payload;
}

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

export type GetHtmlTemplateFunc<TState> = (templateVars: TemplateVars, state: TState) => string;

export interface GetHtml<TState> {
  extensionPath: vscode.Uri;
  template: GetHtmlTemplateFunc<TState>;
  htmlData: HtmlData<TState>;
}

export interface HtmlData<TState> {
  data: TState;
  title: string;
  webview: vscode.Webview;
}

import * as vscode from 'vscode';
import { CMD_OPEN_CUR_WIN } from './constants';
import { WebViewProvider } from './webviews/WebViewProvider';

export type SortIds = 'ascending' | 'descending';

export const registerCommands = (
  context: vscode.ExtensionContext,
  workspaceViewProvider: WebViewProvider
): void => {
  const { registerCommand } = vscode.commands;

  context.subscriptions.push(
    registerCommand(CMD_OPEN_CUR_WIN, (file: string): void => {
      vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(file), false);
    })
  );
};

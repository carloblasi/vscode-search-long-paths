import * as vscode from 'vscode';
import { CMD_OPEN_CUR_WIN } from './constants';
import { WebViewProvider } from './webviews/WebViewProvider';

export const registerCommands = (context: vscode.ExtensionContext, workspaceViewProvider: WebViewProvider): void => {
  const { registerCommand } = vscode.commands;

  context.subscriptions.push(
    registerCommand(CMD_OPEN_CUR_WIN, (file: string): void => {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.file(file));
    }),
    registerCommand('workbench.view.extension.search-long-paths', (): void => {
      workspaceViewProvider.onActivate();
    }),
    registerCommand('workbench.view.extension.search-long-paths.focus', (): void => {
      workspaceViewProvider.onActivate();
    })
  );
};

import * as vscode from 'vscode';
import { CMD_OPEN_CUR_WIN } from './constants';
import { invalidateCachedFiles } from './webviews/findStringInFolder';
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
    registerCommand('search-long-paths-webview-workspace.focus', (): void => {
      workspaceViewProvider.onActivate();
    })
  );

  const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.*');
  // rename is taken care of by create/delete
  context.subscriptions.push(
    fileSystemWatcher.onDidCreate(() => {
      invalidateCachedFiles();
    }),
    fileSystemWatcher.onDidDelete(() => {
      invalidateCachedFiles();
    })
  );
};

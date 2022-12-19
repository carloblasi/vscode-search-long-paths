import * as vscode from 'vscode';
import { WebViewProvider } from './webviews/WebViewProvider';

export const registerWebviews = (context: vscode.ExtensionContext, webViewProvider: WebViewProvider): void => {
  const regWebview = vscode.window.registerWebviewViewProvider(WebViewProvider.viewType, webViewProvider);

  context.subscriptions.push(regWebview);
};

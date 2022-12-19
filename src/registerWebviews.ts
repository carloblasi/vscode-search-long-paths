import * as vscode from 'vscode';
import { WebViewProvider } from './webviews/WebViewProvider';

export const registerWebviews = (context: vscode.ExtensionContext, webViewProvider: WebViewProvider): void => {
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(WebViewProvider.viewType, webViewProvider)
  );
  context.subscriptions.push(vscode.window.registerWebviewViewProvider(WebViewProvider.viewType, webViewProvider));
};

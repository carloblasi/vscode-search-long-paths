import * as vscode from 'vscode';
import { getVscodeLang, loadTranslations } from 'vscode-ext-localisation';
import { registerCommands } from './registerCommands';
import { registerWebviews } from './registerWebviews';
import { WebViewProvider } from './webviews/WebViewProvider';

export const activate = (context: vscode.ExtensionContext): void => {
  const lang = getVscodeLang(process.env.VSCODE_NLS_CONFIG);
  loadTranslations(lang, context.extensionPath);

  const workspaceViewProvider = new WebViewProvider(context.extensionUri);

  registerCommands(context, workspaceViewProvider);
  registerWebviews(context, workspaceViewProvider);
};

export const deactivate = (): void => {};

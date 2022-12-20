import crypto from 'crypto';
import { debounceTime, from, Subject, switchMap } from 'rxjs';
import * as vscode from 'vscode';
import { t } from 'vscode-ext-localisation';
import { CMD_OPEN_CUR_WIN } from '../constants';
import { getHtml } from '../templates';
import { defaultTemplate } from '../templates/defaultTemplate';
import { setSearchTerm, store } from './store';
import { Actions } from './models';

const { executeCommand } = vscode.commands;

export class WebViewProvider implements vscode.WebviewViewProvider, vscode.TextDocumentContentProvider {
  public static readonly viewType = 'search-long-paths-webview-workspace';
  private _view?: vscode.WebviewView;
  searchBoxKeyUp$ = new Subject<{ value: string; include: string; exclude: string }>();

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.searchBoxKeyUp$
      .pipe(
        debounceTime(400),
        switchMap((options) => {
          return from(
            vscode.window.withProgress({ location: { viewId: WebViewProvider.viewType }, cancellable: false }, () => {
              return setSearchTerm(options.value, options.include, options.exclude);
            })
          );
        })
      )
      .subscribe({
        next: () => this.askViewToUpdateList(),
        error: () => store.dispatch((store.state = 'invalid')),
      });
  }

  private askViewToUpdateList() {
    this._view!.webview.postMessage({
      action: 'UPDATE_LIST',
      message: JSON.stringify({
        list: store.visibleFiles,
        search: store.search,
        include: store.include,
        exclude: store.exclude,
      }),
    });
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    this.setupWebview(webviewView);
    this.render();
  }

  private render() {
    if (this._view) {
      const nonce = crypto.randomBytes(16).toString('hex');

      this._view.webview.html = getHtml(
        {
          extensionPath: this._extensionUri,
          template: defaultTemplate,
          htmlData: {
            data: { ...store },
            title: t('views.title'),
            webview: this._view.webview,
          },
        },
        nonce
      );
    } else {
      vscode.window.showErrorMessage(t('errors.viewNotFound'));
    }
  }

  private setupWebview(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.onDidChangeVisibility(() => {
      if (this._view?.visible && store.visibleFiles.length > 0) {
        this.askViewToUpdateList();
      }
    });

    webviewView.webview.onDidReceiveMessage((message: { action: Actions; payload: string }) => {
      const { action, payload } = message;

      console.log('### message', action, payload);

      switch (action) {
        case Actions.OPEN_CUR_WINDOW:
          if (payload) {
            executeCommand(CMD_OPEN_CUR_WIN, payload, true);
          }
          break;

        case Actions.SEARCH:
          if (payload !== undefined) {
            this.searchBoxKeyUp$.next(JSON.parse(payload));
          }
          break;

        case Actions.SHOW_SETTINGS:
          executeCommand('workbench.action.openSettings', 'searchLongPaths');
          break;

        case Actions.OPEN_IN_EDITOR:
          const uri = vscode.Uri.parse(
            WebViewProvider.viewType + ':' + store.visibleFiles.map((_) => _.file).join('\n')
          );
          vscode.workspace.openTextDocument(uri).then((doc) => {
            vscode.window.showTextDocument(doc, { preview: false });
          });
          break;

        default:
          break;
      }
    });
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    return uri.path;
  }

  public focusInput() {
    if (this._view?.visible) {
      this._view.webview.postMessage({ action: Actions.FOCUS_SEARCH });
    }
  }

  onActivate() {
    this.focusInput();

    const activeEditor = vscode.window.activeTextEditor;
    const selectedText = activeEditor?.document.getText(activeEditor?.selection);
    if (selectedText) {
      this._view!.webview.postMessage({
        action: 'SET_SEARCH_INPUT',
        message: selectedText,
      });
    }
  }
}

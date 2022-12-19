import * as vscode from 'vscode';
import {
  FS_FOLDER_CSS,
  FS_FOLDER_IMAGES,
  FS_FOLDER_IMAGES_DARK,
  FS_FOLDER_IMAGES_LIGHT,
  FS_FOLDER_JS,
  FS_FOLDER_RESOURCES,
} from '../constants';
import { TemplateVars, WorkspaceState } from '../webviews/models';

const { joinPath } = vscode.Uri;

export const getHtml = (
  options: {
    extensionPath: vscode.Uri;
    template: (templateVars: TemplateVars, state: WorkspaceState) => string;
    htmlData: {
      data: WorkspaceState;
      title: string;
      webview: vscode.Webview;
    };
  },
  nonce: string
): string => {
  const { extensionPath, template, htmlData } = options;
  const { data, title, webview } = htmlData;
  const cssFolderUri = webview.asWebviewUri(joinPath(extensionPath, FS_FOLDER_RESOURCES, FS_FOLDER_CSS));
  const imgDarkFolderUri = webview.asWebviewUri(
    joinPath(extensionPath, FS_FOLDER_RESOURCES, FS_FOLDER_IMAGES, FS_FOLDER_IMAGES_DARK)
  );
  const imgLightFolderUri = webview.asWebviewUri(
    joinPath(extensionPath, FS_FOLDER_RESOURCES, FS_FOLDER_IMAGES, FS_FOLDER_IMAGES_LIGHT)
  );
  const scriptFolderUri = webview.asWebviewUri(joinPath(extensionPath, FS_FOLDER_RESOURCES, FS_FOLDER_JS));

  // Get resource paths
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionPath, 'resources', 'css', 'styles.css'));
  const codiconsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionPath, 'node_modules', 'vscode-codicons', 'dist', 'codicon.css')
  );

  return template(
    {
      cspSource: webview.cspSource,
      cssFolderUri,
      imgDarkFolderUri,
      imgLightFolderUri,
      nonce,
      scriptFolderUri,
      title,
      styleUri,
      codiconsUri,
    },
    data
  );
};

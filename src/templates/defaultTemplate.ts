import { t } from 'vscode-ext-localisation';
import { FS_WEBVIEW_WORKSPACE_CSS, FS_WEBVIEW_WORKSPACE_JS } from '../constants';
import { RenderVars, TemplateVars, WorkspaceState } from '../webviews/models';
import { listView } from './listView';

export const defaultTemplate = (options: TemplateVars, state: WorkspaceState): string => {
  const {
    cspSource,
    cssFolderUri,
    imgDarkFolderUri,
    imgLightFolderUri,
    nonce,
    scriptFolderUri,
    styleUri,
    codiconsUri,
  } = options;

  const renderVars: RenderVars = { imgDarkFolderUri, imgLightFolderUri };
  const titleAttr = t('views.title');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        ${metaTags(nonce, cspSource)}
        <title>${titleAttr}</title>
        <link href="${cssFolderUri}/${FS_WEBVIEW_WORKSPACE_CSS}" nonce="${nonce}" rel="stylesheet" type="text/css">

        <link href="${styleUri}" rel="stylesheet" />
				<link href="${codiconsUri}" rel="stylesheet" />

      </head>

      <body>
        ${listView(state, renderVars)}
        <script nonce="${nonce}" src="${scriptFolderUri}/virtualized-list.min.js"></script>
        <script nonce="${nonce}" src="${scriptFolderUri}/${FS_WEBVIEW_WORKSPACE_JS}"></script>
      </body>
    </html>`;
};

const metaTags = (nonce: string, cspSource: string): string => {
  return `
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" 
      content="default-src ${cspSource} vscode-resource: 'nonce-${nonce}';
      img-src ${cspSource} vscode-resource: data: 'nonce-${nonce}';
      script-src ${cspSource} vscode-resource: 'unsafe-inline' 'unsafe-eval';
      style-src ${cspSource} vscode-resource: 'unsafe-inline'";
    >
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  `;
};

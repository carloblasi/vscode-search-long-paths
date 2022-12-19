import { t } from 'vscode-ext-localisation';
import { WorkspaceState, RenderVars } from '../../webviews/models';
import { getImgUrls } from '../getImgUrls';

export const invalidView = (state: WorkspaceState, renderVars: RenderVars): string => {
  const { dark, light } = getImgUrls(renderVars, 'error');

  return `
    <section class="view invalid">
      <span class="view__icon invalid__icon">
        <img alt="" data-theme="dark" src="${dark}" />
        <img alt="" data-theme="light" src="${light}" />
      </span>
      <p class="view__message">
        <span class="view__message-title">${t('webViews.workspace.inValid')}</span>
        ${settingsLink()}
      </p>
    </section>`;
};

const settingsLink = (): string => {
  const linkText = t('webViews.workspace.checkSettings');

  return `<span role="link" class="view__link view__message-description">${linkText}</span>`;
};

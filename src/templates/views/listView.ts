import { t } from 'vscode-ext-localisation';
import { getImgUrls } from '..';
import { workspace } from 'vscode';
import { WorkspaceState, RenderVars, File } from '../../webviews/models';

export const listView = (state: WorkspaceState, renderVars: RenderVars): string => {
  return `
    <div class="view list" data-showsearch=true>
      <form id="searchWorkspacesForm" role="search" class="list__search">
        <input 
          aria-label="Search Filenames"
          autocapitalize="off"
          autocorrect="off"
          id="searchWorkspaces"
          name="search"
          placeholder="Search"
          spellcheck="false"
          value="${state.search}"
        >
    
        <h4>files to include</h4>
        <input 
          aria-label="Include settings"
          autocapitalize="off"
          autocorrect="off"
          id="includeSettings"
          name="includeSettings"
          placeholder="e.g. *.ts, src/**/include"
          spellcheck="false"
          value="${state.include}"
        >
          
        <h4>files to exclude</h4>
        <input 
          aria-label="Exclude settings"
          autocapitalize="off"
          autocorrect="off"
          id="excludeSettings"
          name="excludeSettings"
          placeholder="e.g. *.ts, src/**/exclude"
          spellcheck="false"
          value="${state.exclude}"
        >
        <div class="results">
          <span id="resultsText">0 results</span>
        </div>
      </form>
      <div id="list" class="list__list"></div>
    </div>
  `;
};

export const list = (state: WorkspaceState, renderVars: RenderVars) => {
  const { files, search, visibleFiles } = state;

  if (files && visibleFiles.length > 1) {
    return `<div id="list" class="list__list"></div>`;
  }

  if (!files) {
    const { dark, light } = getImgUrls(renderVars, 'error');

    return `
      <section class="view list list--empty">
        <span class="view__icon list__icon">
          <img alt="" data-theme="dark" src="${dark}" />
          <img alt="" data-theme="light" src="${light}" />
        </span>
        <p class="view__message">
        <br><br><br>
        </div>
          <span class="view__message-title">${t('webViews.workspace.list-empty')}</span>
        </p>
      </section>
    `;
  }

  if (files === false) {
    return '';
  }

  if (visibleFiles.length < 1) {
    if (search) {
      return `
          <div class="list__list-searchedout">
            <p>${t('webViews.workspace.searchedOut')}</p>
          </div>
        `;
    } else {
      return '';
    }
  }
};

const codicon: string = workspace.getConfiguration().get('searchLongPaths.codicon') || '';
export const listItem = (file: File, renderVars: RenderVars) => {
  const { file: dataFile, isSelected, label, path } = file;
  const tooltip = isSelected
    ? t('webViews.workspace.listItem.selected')
    : t('webViews.workspace.listItem.openCurWin', { label });
  const classes = `list__element ${isSelected ? 'list__element--selected' : 'list__element--unselected'}`;

  return `
    <li class="list__item">
      <span class="${classes}" data-file="${dataFile}" tabindex="0" title="${tooltip}">
      <i class="codicon codicon-${codicon}"></i> <span class="list__title">&nbsp;${label}</span>&nbsp;
        ${path ? `<span class="list__description">${path}</span>` : ''}

      </span>
    </li>
  `;
};

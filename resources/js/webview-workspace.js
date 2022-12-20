// @ts-check
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const searchInput = document.getElementById('searchWorkspaces');
  const includeInput = document.getElementById('includeSettings');
  const excludeInput = document.getElementById('excludeSettings');
  const openInEditorButton = document.getElementById('open-in-editor');
  const openInEditorWrapper = document.getElementById('open-in-editor-wrapper');

  const wsElements = Array.from(document.getElementsByClassName('list__element--unselected'));

  let searchTerm = '';
  let includeTerm = '';
  let excludeTerm = '';

  /** @param {string} action @param {any} payload */
  const sendMessage = (action, payload = undefined) => {
    const message = { action };

    if (payload !== undefined) {
      message.payload = payload;
    }

    vscode.postMessage(message);
  };
  window['sendMessage'] = sendMessage;

  // @ts-check
  /** @param {Array<{ file: string; isSelected: boolean; label: string; path: string; }>} list */
  const updateList = (list) => {
    // @ts-ignore
    const VirtualizedList = window.VirtualizedList.default;
    const container = document.getElementById('list');

    if (container) {
      container.innerHTML = '';
      if (list.length > 0) {
        new VirtualizedList(container, {
          height: container?.offsetHeight,
          rowCount: list.length,
          /** @param {number} i */
          renderRow: (i) => {
            const { file: dataFile, isSelected, label, path } = list[i];
            // const tooltip = isSelected
            //   ? t('webViews.workspace.listItem.selected')
            //   : t('webViews.workspace.listItem.openCurWin', { label });

            const listItemEl = document.createElement('div');
            listItemEl.classList.add('list__item');

            const listElementEl = document.createElement('span');
            listElementEl.classList.add('list__element');
            listElementEl.classList.add(isSelected ? 'list__element--selected' : 'list__element--unselected');
            listElementEl.tabIndex = 0;
            listElementEl.setAttribute('data-file', dataFile);
            listElementEl.innerHTML = `
              <i class="codicon codicon-"></i> <span class="list__title">${label}</span>
              ${path ? `<span class="list__description">${path}</span>` : ''}`;

            listElementEl.onclick = (event) => {
              // @ts-ignore
              sendMessage('OPEN_CUR_WINDOW', event.currentTarget?.dataset?.file);
            };

            listItemEl.appendChild(listElementEl);

            return listItemEl;
          },
          rowHeight: 24,
          estimatedRowHeight: 24,
        });
      }

      const resultsSpan = document.getElementById('resultsText');
      if (resultsSpan) {
        resultsSpan.textContent = list.length + ' results';
      }

      if (list.length > 0) {
        openInEditorWrapper?.removeAttribute('hidden');
      } else {
        openInEditorWrapper?.setAttribute('hidden', 'true');
      }
    }
  };
  window['updateList'] = updateList;

  const handleElementClick = (event) => {
    event.stopPropagation();
    sendMessage('OPEN_CUR_WINDOW', event.currentTarget.dataset.file);
  };

  const handleRightClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onInputChange = (event) => {
    event.preventDefault();

    let changes = false;

    // @ts-ignore
    if (searchTerm !== searchInput?.value) {
      // @ts-ignore
      searchTerm = searchInput?.value;
      changes = true;
    }
    // @ts-ignore
    if (includeTerm !== includeInput?.value) {
      // @ts-ignore
      includeTerm = includeInput?.value;
      changes = true;
    }
    // @ts-ignore
    if (excludeTerm !== excludeInput?.value) {
      // @ts-ignore
      excludeTerm = excludeInput?.value;
      changes = true;
    }

    if (changes) {
      sendMessage('SEARCH', JSON.stringify({ value: searchTerm, include: includeTerm, exclude: excludeTerm }));
      const container = document.getElementById('list');
      if (container) {
        container.innerHTML = '';
      }
      const resultsSpan = document.getElementById('resultsText');
      if (resultsSpan) {
        resultsSpan.textContent = '0 results';
      }
      openInEditorWrapper?.setAttribute('hidden', 'true');
    }
  };

  function onLoad() {
    openInEditorWrapper?.setAttribute('hidden', 'true');

    if (searchInput) {
      searchInput.addEventListener('change', onInputChange);
      searchInput.addEventListener('keyup', onInputChange);
    }
    if (includeInput) {
      includeInput.addEventListener('change', onInputChange);
      includeInput.addEventListener('keyup', onInputChange);
    }
    if (excludeInput) {
      excludeInput.addEventListener('change', onInputChange);
      excludeInput.addEventListener('keyup', onInputChange);
    }

    wsElements.forEach((element) => {
      element.addEventListener('contextmenu', handleRightClick);
      element.addEventListener('click', handleElementClick);
    });

    // console.log('DOM Loaded');
    if (searchInput && document.activeElement?.id !== 'searchWorkspaces') {
      searchInput.focus();
      // @ts-ignore
      searchInput.setSelectionRange(100, 100);
    }

    if (openInEditorButton) {
      openInEditorButton.onclick = (event) => {
        event.preventDefault();
        sendMessage('OPEN_IN_EDITOR');
      };
    }
  }

  function onMessageReceived(event) {
    const message = event.data;

    switch (message.action) {
      case 'FOCUS_SEARCH':
        if (searchInput && document.activeElement?.id !== 'searchWorkspaces') {
          searchInput.focus();
          // @ts-ignore
          searchInput.setSelectionRange(1000, 1000);
        }
        break;

      case 'UPDATE_LIST':
        const { list, search, include, exclude } = JSON.parse(message.message);
        // console.log(list);
        updateList(list);

        break;

      case 'SET_SEARCH_INPUT':
        if (searchInput) {
          // @ts-ignore
          searchInput.value = message.message;
        }
      default:
        break;
    }
  }

  document.addEventListener('DOMContentLoaded', onLoad);
  window.addEventListener('message', onMessageReceived);
})();

// --- UTILITY ---
function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

// --- STATE ---
const state = {
  activeTheme: 'light',
  isFocusMode: false,
  savedRange: null,
  activeSnippetIndex: 0,
  filteredSnippets: [],
  snippetTargetCodeEl: null,
  projects: [],
  activeProjectId: null,
  activeProjectFileId: null,
  projectPanelCollapsed: false,
  snippetUndoStack: [],
  restoringSnippetSnapshot: false,
  pageLinkDialogOpen: false,
  mermaidRenderCount: 0,
  filePath: null,
  isDirty: false,
  autosaveTimer: null,
  settings: {
    editorFont: 'serif',
    fontSize: 18,
    autosaveEnabled: true,
    theme: 'light',
    followSystemTheme: true,
    accentColor: '#53794a',
    paperColor: '#fffef8',
    lightCanvasColor: '#fffef8',
    darkCanvasColor: '#141922',
    canvasWidth: 820,
    canvasHeight: 1200,
    folderSyncEnabled: true,
    folderSyncPreferenceSet: false,
    syncFolderPath: '',
    typewriterMode: false
  }
};

// --- TAB STATE ---
let nextTabId = 2;
const tabs = [];
let activeTabId = 1;

// --- SNIPPET CATALOG ---
const snippetCatalog = [
  {
    name: 'JavaScript - Hello Developer',
    desc: 'Prints a console message welcoming the user.',
    lang: 'javascript',
    tags: ['js', 'javascript', 'log', 'function', 'hello'],
    code: `// Elegant greetings for pair programming
function welcomeAgent() {
  const agentName = "Antigravity";
  const year = new Date().getFullYear();
  console.log(\`[\${year}] Welcome to a new dimension of pair programming with \${agentName}!\`);
}

welcomeAgent();`
  },
  {
    name: 'JavaScript - Async Fetch API',
    desc: 'Standard async/await API request template with error handling.',
    lang: 'javascript',
    tags: ['js', 'javascript', 'async', 'await', 'fetch', 'api', 'http'],
    code: `// Fetch data asynchronously from a REST endpoint
async function fetchData(url = '/api/documents') {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`Network response was not OK: \${response.status}\`);
    }
    const data = await response.json();
    console.log("Successfully fetched payload:", data);
    return data;
  } catch (error) {
    console.error("Fetch transaction failed:", error);
  }
}`
  },
  {
    name: 'Python - Quick Sort Algorithm',
    desc: 'Clean, idiomatic implementation of Python Quick Sort.',
    lang: 'python',
    tags: ['py', 'python', 'sort', 'algorithm', 'recursion'],
    code: `# In-place recursion sorting algorithm
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

numbers = [3, 6, 8, 10, 1, 2, 1]
print("Original Array:", numbers)
print("Sorted Array:", quick_sort(numbers))`
  },
  {
    name: 'Python - Read Local File',
    desc: 'Safely open and parse file resources using a context manager.',
    lang: 'python',
    tags: ['py', 'python', 'file', 'read', 'with', 'open'],
    code: `# Safe resource extraction using context managers
def extract_document_contents(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as target_file:
            content = target_file.read()
            print(f"Read {len(content)} characters successfully.")
            return content
    except FileNotFoundError:
        print(f"Error: The resource at '{filepath}' was not found.")
        return None`
  },
  {
    name: 'CSS - Flexbox Centering Grid',
    desc: 'Perfect vertical and horizontal centering layout toolkit.',
    lang: 'css',
    tags: ['css', 'style', 'layout', 'flex', 'center', 'align'],
    code: `/* Ultimate Flexbox layout alignment system */
.centering-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`
  },
  {
    name: 'CSS - Responsive Media Query',
    desc: 'Standard breakpoints for highly responsive mobile viewport layouts.',
    lang: 'css',
    tags: ['css', 'style', 'responsive', 'media', 'mobile', 'query'],
    code: `/* Standard mobile and handheld responsiveness blueprint */
@media screen and (max-width: 768px) {
  .editor-workspace {
    padding: 1rem 0 !important;
  }

  .paper {
    padding: 1.5rem !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .app-header {
    flex-direction: column;
    align-items: stretch;
  }
}`
  },
  {
    name: 'SQL - Aggregation & Query',
    desc: 'Selects average revenue grouped and sorted with conditions.',
    lang: 'sql',
    tags: ['sql', 'query', 'database', 'aggregate', 'group', 'join'],
    code: `-- Aggregate and sort data with sub-categorizations
SELECT
    d.department_name,
    COUNT(e.employee_id) AS total_staff,
    ROUND(AVG(e.salary), 2) AS average_salary
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id
WHERE e.hire_date >= '2025-01-01'
GROUP BY d.department_name
HAVING AVG(e.salary) > 65000
ORDER BY average_salary DESC;`
  },
  {
    name: 'C++ - Hello World & Struct',
    desc: 'Starter template containing Standard I/O and object blueprint.',
    lang: 'cpp',
    tags: ['cpp', 'c++', 'hello', 'class', 'struct', 'main'],
    code: `#include <iostream>
#include <string>
#include <vector>

struct Document {
    std::string title;
    int wordCount;
};

int main() {
    Document doc = {"frank Release", 450};
    std::cout << "Project: " << doc.title << "\\n";
    std::cout << "Loaded Words: " << doc.wordCount << "\\n";
    return 0;
}`
  },
  {
    name: 'R - Data Wrangling with dplyr',
    desc: 'Filter, group, and summarise a data frame using tidyverse verbs.',
    lang: 'r',
    tags: ['r', 'dplyr', 'tidyverse', 'data', 'wrangling', 'pipe'],
    code: `library(dplyr)

# Load built-in dataset
data(mtcars)
mtcars <- as_tibble(mtcars, rownames = "model")

# Tidy pipeline: filter → group → summarise → arrange
result <- mtcars |>
  filter(cyl %in% c(4, 6)) |>
  group_by(cyl) |>
  summarise(
    n          = n(),
    mean_mpg   = round(mean(mpg), 2),
    median_hp  = median(hp),
    .groups    = "drop"
  ) |>
  arrange(desc(mean_mpg))

print(result)`
  },
  {
    name: 'R - ggplot2 Visualisation',
    desc: 'Scatter plot with a smoothed regression line and clean theme.',
    lang: 'r',
    tags: ['r', 'ggplot2', 'plot', 'visualisation', 'chart', 'tidyverse'],
    code: `library(ggplot2)

# Scatter plot: engine displacement vs fuel efficiency
ggplot(mpg, aes(x = displ, y = hwy, colour = class)) +
  geom_point(alpha = 0.7, size = 2.5) +
  geom_smooth(method = "loess", se = TRUE,
              colour = "grey40", linewidth = 0.8) +
  scale_colour_viridis_d(option = "plasma", end = 0.85) +
  labs(
    title    = "Highway MPG vs Engine Displacement",
    subtitle = "LOESS smoother with 95% confidence band",
    x        = "Displacement (litres)",
    y        = "Highway MPG",
    colour   = "Vehicle class"
  ) +
  theme_minimal(base_size = 13) +
  theme(legend.position = "bottom")`
  },
  {
    name: 'R - Linear Regression & Summary',
    desc: 'Fit an OLS model, inspect coefficients, and check assumptions.',
    lang: 'r',
    tags: ['r', 'regression', 'lm', 'statistics', 'model', 'ols'],
    code: `# Ordinary Least Squares regression
model <- lm(mpg ~ wt + hp + cyl, data = mtcars)

# Coefficient table with 95% CIs
summary(model)
confint(model, level = 0.95)

# Diagnostic plots (residuals, Q-Q, leverage)
par(mfrow = c(2, 2))
plot(model)

# Extract key stats
cat("R-squared :", round(summary(model)$r.squared, 4), "\\n")
cat("Adj R-sq  :", round(summary(model)$adj.r.squared, 4), "\\n")
cat("RMSE      :", round(sqrt(mean(residuals(model)^2)), 4), "\\n")`
  },
  {
    name: 'Bash - Directory Archive Script',
    desc: 'Shell script to dynamically compress and back up folders.',
    lang: 'bash',
    tags: ['bash', 'sh', 'shell', 'backup', 'archive'],
    code: `#!/bin/bash
# Automate workspace compression backups
SOURCE_DIR="./snippet-editor"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="editor_backup_\${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"
tar -czf "\${BACKUP_DIR}/\${ARCHIVE_NAME}" "$SOURCE_DIR"

echo "Backup transaction completed successfully."
echo "Created archive: \${BACKUP_DIR}/\${ARCHIVE_NAME}"`
  }
];

// --- SELECTORS ---
const editor           = document.getElementById('editor');
const documentTitle    = document.getElementById('document-title');
const saveStatePill    = document.getElementById('save-state-pill');
const focusBtn         = document.getElementById('focus-btn');
const exitFocusBtn     = document.getElementById('exit-focus-btn');
const exportDropdownBtn= document.getElementById('export-dropdown-btn');
const exportMenu       = document.getElementById('export-menu');
const fileSaveBtn      = document.getElementById('file-save');
const fileSaveAsBtn    = document.getElementById('file-save-as');
const fileOpenBtn      = document.getElementById('file-open');
const fileSettingsBtn  = document.getElementById('file-settings');

const themeToggleBtn = document.getElementById('theme-toggle');

const formatBlockSelect    = document.getElementById('format-block');
const toolbarInsertSnippet = document.getElementById('toolbar-insert-snippet');

// Snippet modal
const snippetModal      = document.getElementById('snippet-modal');
const paletteSearch     = document.getElementById('palette-search');
const paletteResults    = document.getElementById('palette-results');
const palettePreview    = document.getElementById('palette-preview');
const palettePreviewCode= document.getElementById('palette-preview-code');

// Footer stats
const statWords   = document.getElementById('stat-words');
const statChars   = document.getElementById('stat-chars');
const statReading = document.getElementById('stat-reading');
const floatingWords = document.getElementById('floating-words');
const floatingChars = document.getElementById('floating-chars');

// Settings modal (autosave only)
const settingsModal  = document.getElementById('settings-modal');
const settingsClose  = document.getElementById('settings-close');
const settingsAutosave = document.getElementById('settings-autosave');
const settingsTypewriter = document.getElementById('settings-typewriter');
const settingsFolderSync = document.getElementById('settings-folder-sync');
const settingsFolderPath = document.getElementById('settings-folder-path');
const settingsFolderChoose = document.getElementById('settings-folder-choose');
const contextToolbar = document.getElementById('context-toolbar');
const ctxFont = document.getElementById('ctx-font');
const ctxFontDec = document.getElementById('ctx-font-dec');
const ctxFontInc = document.getElementById('ctx-font-inc');
const ctxMoreToggle = document.getElementById('ctx-more-toggle');
const ctxBlock = document.getElementById('ctx-block');
const commandModal = document.getElementById('command-modal');
const commandSearch = document.getElementById('command-search');
const commandResults = document.getElementById('command-results');
const embedModal = document.getElementById('embed-modal');
const embedCodeInput = document.getElementById('embed-code-input');
const embedInsertBtn = document.getElementById('embed-insert');
const embedCancelBtn = document.getElementById('embed-cancel');
const embedCloseBtn = document.getElementById('embed-close');
const slashPopover = document.getElementById('slash-popover');
const slashResults = document.getElementById('slash-results');
const appBody = document.getElementById('app-body');
const projectPanel = document.getElementById('project-panel');
const projectPanelToggle = document.getElementById('project-panel-toggle');
const projectList = document.getElementById('project-list');
const backlinksPanel = document.getElementById('backlinks-panel');
const backlinksList = document.getElementById('backlinks-list');
const backlinksCount = document.getElementById('backlinks-count');
const projectNewBtn = document.getElementById('project-new');
const projectFileNewBtn = document.getElementById('project-file-new');
const projectSearch = document.getElementById('project-search');
const headerNewTabBtn = document.getElementById('header-new-tab-btn');
const zoomDock = document.getElementById('zoom-dock');
const zoomSlider = document.getElementById('zoom-slider');
const zoomReset = document.getElementById('zoom-reset');
const zoomOut = document.getElementById('zoom-out');
const zoomIn = document.getElementById('zoom-in');
let slashState = null;

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  applySettings();
  initTabs();
  setupEditor();
  setupToolbar();
  setupThemeSystem();
  setupDropdownMenus();
  setupSnippetPalette();
  setupFileActions();
  setupSettings();
  setupExports();
  setupColorPickers();
  setupFloatingContextToolbar();
  setupCommandPalette();
  setupEmbedModal();
  setupSlashPopover();
  setupProjectPanel();
  setupTemplateChips();
  setupTableControls();
  setupSearch();
  setupImagePaste();
  setupLiveRenderers();
  setupZoomDock();
  updateStats();
  setupAutosave();
  bindEmbeddedCopyButtons();
  highlightAllCodeBlocks();
  bindAllCodeBlocks();
  bindAllTables();
  bindAllImages();
  bindEmbedBlocks();
  renderLiveEmbeds();
  setupPageGuides();
  renderBacklinks();

  headerNewTabBtn && headerNewTabBtn.addEventListener('click', newTab);
});

// ─────────────────────────────────────────────
// TAB SYSTEM
// ─────────────────────────────────────────────
function initTabs() {
  if (!tabs.length) tabs.push({
    id: 1,
    title: documentTitle.value || 'Untitled Draft',
    html: editor.innerHTML,
    isDirty: false,
    filePath: null
  });
  renderTabs();
}

function newTab() {
  if (activeProject()) {
    createProjectFile(state.activeProjectId, { title: 'Untitled', promptForName: false });
    return;
  }
  saveActiveTabState();
  const id = nextTabId++;
  tabs.push({ id, title: 'Untitled Draft', html: '<p><br></p>', isDirty: false, filePath: null });
  switchToTab(id, false);
}

function closeTab(id) {
  const project = activeProject();
  if (project) {
    if (project.files.length <= 1) return;
    const idx = project.files.findIndex(file => file.id === id);
    if (idx === -1) return;
    const wasActive = id === state.activeProjectFileId;
    project.files.splice(idx, 1);
    if (wasActive) {
      const nextFile = project.files[Math.max(0, idx - 1)] || project.files[0];
      state.activeProjectFileId = nextFile.id;
      persistProjects();
      loadProjectFile(project.id, nextFile.id);
    } else {
      persistProjects();
      renderProjectPanel();
      renderTabs();
    }
    return;
  }

  if (tabs.length <= 1) return;
  const idx = tabs.findIndex(t => t.id === id);
  if (idx === -1) return;

  if (id === activeTabId) {
    const adjacent = tabs[idx > 0 ? idx - 1 : idx + 1];
    if (adjacent) switchToTab(adjacent.id, false);
  }
  tabs.splice(tabs.findIndex(t => t.id === id), 1);
  renderTabs();
}

function saveActiveTabState() {
  if (activeProjectFile()) {
    syncActiveProjectFile();
    return;
  }
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;
  tab.title    = documentTitle.value || 'Untitled Draft';
  tab.html     = cleanEditorCloneForStorage().innerHTML;
  tab.isDirty  = state.isDirty;
  tab.filePath = state.filePath;
}

function switchToTab(id, saveFirst = true) {
  const project = activeProject();
  if (project && project.files.some(file => file.id === id)) {
    if (saveFirst) syncActiveProjectFile();
    loadProjectFile(project.id, id);
    return;
  }

  if (saveFirst) saveActiveTabState();
  activeTabId = id;
  const tab = tabs.find(t => t.id === id);
  if (!tab) return;

  documentTitle.value = tab.title;
  editor.innerHTML    = tab.html;
  state.isDirty       = tab.isDirty;
  state.filePath      = tab.filePath || null;

  // data-kb-bound / data-hl-bound survive innerHTML serialisation, so clear
  // them now so bindAllCodeBlocks() can re-attach live event listeners.
  editor.querySelectorAll('[data-kb-bound]').forEach(el => delete el.dataset.kbBound);
  editor.querySelectorAll('[data-hl-bound]').forEach(el => delete el.dataset.hlBound);

  renderTabs();
  highlightAllCodeBlocks();
  bindEmbeddedCopyButtons();
  bindAllCodeBlocks();
  bindAllTables();
  bindAllImages();
  bindEmbedBlocks();
  renderLiveEmbeds();
  updateStats();
  updateWindowTitle();
  updatePageGuides();
  renderBacklinks();
  editor.focus();
}

function renderTabs() {
  const scroll = document.getElementById('tabs-scroll');
  if (!scroll) return;
  const tabBar = document.getElementById('tab-bar');
  scroll.innerHTML = '';

  const project = activeProject();
  const visibleTabs = project
    ? project.files.map(file => ({
        id: file.id,
        title: file.title || 'Untitled',
        isDirty: file.id === state.activeProjectFileId && state.isDirty
      }))
    : tabs;
  activeTabId = project ? state.activeProjectFileId : activeTabId;
  const tabWidth = 146;
  const tabGap = 5;
  const visibleCount = Math.max(1, Math.min(visibleTabs.length || 1, 5));
  const expandedWidth = Math.max(184, (visibleCount * tabWidth) + ((visibleCount - 1) * tabGap) + 38);
  const scrollWidth = Math.max(146, (visibleCount * tabWidth) + ((visibleCount - 1) * tabGap));
  if (tabBar) {
    tabBar.style.setProperty('--tab-expanded-width', `${expandedWidth}px`);
    tabBar.style.setProperty('--tab-scroll-expanded-width', `${scrollWidth}px`);
  }

  visibleTabs.forEach(tab => {
    const el = document.createElement('div');
    el.className = `tab${tab.id === activeTabId ? ' active' : ''}`;
    el.dataset.tabId = String(tab.id);

    el.innerHTML = `
      ${tab.isDirty ? '<span class="tab-dirty"></span>' : ''}
      <span class="tab-title" contenteditable="true" spellcheck="false" role="textbox" aria-label="Rename tab">${escapeHTML(tab.title)}</span>
      <button class="tab-close" title="Close tab" aria-label="Close tab">
        <svg viewBox="0 0 10 10" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
        </svg>
      </button>`;

    el.addEventListener('click', e => {
      if (e.target.closest('.tab-close') || e.target.closest('.tab-title')) return;
      if (tab.id !== activeTabId) switchToTab(tab.id);
    });

    const titleEl = el.querySelector('.tab-title');
    titleEl.addEventListener('mousedown', e => e.stopPropagation());
    titleEl.addEventListener('focus', () => {
      if (tab.id !== activeTabId) {
        switchToTab(tab.id);
        requestAnimationFrame(() => {
          const activeTitle = document.querySelector('.tab.active .tab-title');
          if (activeTitle) {
            activeTitle.focus();
            selectElementContents(activeTitle);
          }
        });
        return;
      }
      selectElementContents(titleEl);
    });
    titleEl.addEventListener('input', () => renameActiveTabFromElement(titleEl));
    titleEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        titleEl.blur();
        editor.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        titleEl.textContent = documentTitle.value || 'Untitled';
        titleEl.blur();
        editor.focus();
      }
    });
    titleEl.addEventListener('blur', () => {
      if (!titleEl.textContent.trim()) titleEl.textContent = 'Untitled';
      renameActiveTabFromElement(titleEl);
    });

    el.querySelector('.tab-close').addEventListener('click', e => {
      e.stopPropagation();
      closeTab(tab.id);
    });

    scroll.appendChild(el);
  });

  // Scroll active tab into view
  const active = scroll.querySelector('.tab.active');
  if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function renameActiveTabFromElement(titleEl) {
  const title = titleEl.textContent.trim() || 'Untitled';
  documentTitle.value = title;
  const file = activeProjectFile();
  if (file) {
    file.title = title;
    file.updatedAt = Date.now();
    persistProjects();
    renderProjectPanel();
  } else {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) tab.title = title;
  }
  updateWindowTitle();
}

function selectElementContents(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// ─────────────────────────────────────────────
// EDITOR CORE
// ─────────────────────────────────────────────
function setupEditor() {
  editor.addEventListener('mouseup', () => { saveSelection(); updateToolbarButtonActiveStates(); });
  editor.addEventListener('keyup', () => { saveSelection(); updateStats(); updateToolbarButtonActiveStates(); });
  document.addEventListener('selectionchange', debounce(updateFloatingContextToolbar, 80));

  editor.addEventListener('keydown', e => {
    if (slashState && handleSlashKeydown(e)) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) openSnippetPalette();
      else insertTabSpaces();
    } else if (e.key === '{' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (insertEditorPair(e, '{', '}')) {
        requestAnimationFrame(updateSnippetTriggerFromCaret);
        return;
      }
    } else if (e.key === '<' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (insertEditorPair(e, '<', '>')) {
        requestAnimationFrame(() => {
          const draft = currentPageLinkDraftInfo();
          if (draft) openPageLinkDialogFromDraft(draft);
          else scheduleLiveRender();
        });
        return;
      }
    } else if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && editor.contains(sel.anchorNode)) {
        e.preventDefault();
        saveSelection();
        openSlashPopover();
      }
    }
  });

  editor.addEventListener('input', () => {
    if (slashState) updateActiveInlineCommandFromCaret();
    else updateSnippetTriggerFromCaret();
    const linkDraft = currentPageLinkDraftInfo();
    if (linkDraft && !state.pageLinkDialogOpen) openPageLinkDialogFromDraft(linkDraft);
    markDirty();
    syncActiveProjectFile();
    scheduleLiveRender();
    updateStats();
    renderBacklinks();
    scheduleTypewriterCenter();
    updateFloatingContextToolbar();
  });

  editor.addEventListener('keyup', e => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape', ' '].includes(e.key)) {
      scheduleLiveRender();
    }
  });

  editor.addEventListener('click', e => {
    const link = e.target.closest('.page-link');
    if (link) {
      e.preventDefault();
      openProjectPage(link.dataset.pageLink || link.getAttribute('href') || link.textContent);
    }
  });

  editor.addEventListener('mousedown', placeCaretOnBlankEditorLine);

  documentTitle.addEventListener('input', () => {
    markDirty();
    updateWindowTitle();
    syncActiveProjectFile();
    renderBacklinks();
    const tab = activeProjectFile() || tabs.find(t => t.id === activeTabId);
    if (tab) {
      tab.title = documentTitle.value || 'Untitled Draft';
      activeTabId = activeProjectFile() ? state.activeProjectFileId : activeTabId;
      const activeLabel = document.querySelector('.tab.active .tab-title');
      if (activeLabel) activeLabel.textContent = tab.title;
    }
  });
}

function placeCaretOnBlankEditorLine(e) {
  if (e.button !== 0 || !editor.contains(e.target)) return;
  if (e.target.closest?.('a, button, input, textarea, select, .code-block-wrapper, .frank-table, .frank-figure, .frank-embed-block, [data-live-render], [contenteditable="false"]')) return;

  const pointRange = caretRangeFromPoint(e.clientX, e.clientY);
  if (pointRange && editor.contains(pointRange.startContainer) && pointRange.startContainer !== editor) return;
  if (e.target !== editor && !isClickInEditorBlankSpace(e)) return;

  e.preventDefault();
  const beforeCount = editor.childElementCount;
  const line = ensureEditorLineAtY(e.clientY);
  placeCaretAtEnd(line);
  saveSelection();
  if (editor.childElementCount !== beforeCount) {
    markDirty();
    syncActiveProjectFile();
    updateStats();
    updatePageGuides();
  }
  updateFloatingContextToolbar();
}

function caretRangeFromPoint(x, y) {
  if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (!pos) return null;
    const range = document.createRange();
    range.setStart(pos.offsetNode, pos.offset);
    range.collapse(true);
    return range;
  }
  return null;
}

function isClickInEditorBlankSpace(e) {
  const el = e.target.closest?.('p, h1, h2, h3, h4, li, blockquote, pre, table, figure, .code-block-wrapper, .frank-embed-block');
  if (!el) return true;
  const rect = el.getBoundingClientRect();
  return e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right;
}

function ensureEditorLineAtY(clientY) {
  const blocks = Array.from(editor.children).filter(el => {
    if (!(el instanceof HTMLElement)) return false;
    if (el.matches('[data-live-render], .template-chips')) return false;
    return true;
  });
  const lineHeight = editorLineHeight();
  let target = blocks.find(el => {
    const rect = el.getBoundingClientRect();
    return clientY >= rect.top && clientY <= rect.bottom && isEditableTextBlock(el);
  });
  if (target) return target;

  const last = blocks[blocks.length - 1];
  if (!last) {
    target = blankEditorParagraph();
    editor.appendChild(target);
    return target;
  }

  const lastRect = last.getBoundingClientRect();
  if (clientY <= lastRect.bottom) {
    const before = blocks.find(el => clientY < el.getBoundingClientRect().top);
    target = blankEditorParagraph();
    if (before) editor.insertBefore(target, before);
    else editor.appendChild(target);
    return target;
  }

  let cursorBottom = lastRect.bottom;
  target = last;
  while (cursorBottom + lineHeight * 0.72 < clientY && editor.children.length < 400) {
    target = blankEditorParagraph();
    editor.appendChild(target);
    cursorBottom += lineHeight;
  }
  if (!isEditableTextBlock(target)) {
    target = blankEditorParagraph();
    editor.appendChild(target);
  }
  return target;
}

function blankEditorParagraph() {
  const p = document.createElement('p');
  p.innerHTML = '<br>';
  return p;
}

function isEditableTextBlock(el) {
  return el && el.matches?.('p, h1, h2, h3, h4, blockquote, li');
}

function editorLineHeight() {
  const value = parseFloat(getComputedStyle(editor).lineHeight);
  if (Number.isFinite(value)) return value;
  return Math.max(24, (state.settings.fontSize || 18) * 1.75);
}

const scheduleTypewriterCenter = debounce(() => {
  if (!state.settings.typewriterMode) return;
  const workspace = document.querySelector('.editor-workspace');
  const sel = window.getSelection();
  if (!workspace || !sel || !sel.rangeCount || !editor.contains(sel.anchorNode)) return;
  const range = sel.getRangeAt(0).cloneRange();
  if (!range.collapsed) range.collapse(false);
  const rect = range.getBoundingClientRect();
  if (!rect || (!rect.top && !rect.bottom)) return;
  const workspaceRect = workspace.getBoundingClientRect();
  const caretY = rect.top - workspaceRect.top + workspace.scrollTop;
  const target = Math.max(0, caretY - workspace.clientHeight * 0.48);
  workspace.scrollTo({ top: target, behavior: 'smooth' });
}, 90);

function insertEditorPair(e, open, close) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !editor.contains(sel.anchorNode)) return false;
  const target = selectionElement(sel);
  if (target && target.closest && target.closest('.code-block-wrapper')) return false;
  e.preventDefault();
  const range = sel.getRangeAt(0);
  const selected = sel.toString();
  range.deleteContents();
  const text = document.createTextNode(selected ? `${open}${selected}${close}` : `${open}${close}`);
  range.insertNode(text);
  const nextRange = document.createRange();
  const caretOffset = selected ? text.textContent.length : 1;
  nextRange.setStart(text, caretOffset);
  nextRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(nextRange);
  saveSelection();
  markDirty();
  syncActiveProjectFile();
  updateStats();
  return true;
}

function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    const r = sel.getRangeAt(0);
    if (editor.contains(r.commonAncestorContainer)) state.savedRange = r.cloneRange();
  }
}

function restoreSelection() {
  if (state.savedRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(state.savedRange);
  }
}

function pushSnippetUndoSnapshot() {
  state.snippetUndoStack.push({
    html: editor.innerHTML,
    title: documentTitle.value,
    projectFileId: state.activeProjectFileId,
    tabId: activeTabId
  });
  if (state.snippetUndoStack.length > 30) state.snippetUndoStack.shift();
}

function restoreSnippetUndoSnapshot() {
  const snap = state.snippetUndoStack.pop();
  if (!snap) return false;
  state.restoringSnippetSnapshot = true;
  editor.innerHTML = snap.html;
  documentTitle.value = snap.title || documentTitle.value;
  bindEmbeddedCopyButtons();
  bindAllCodeBlocks();
  bindAllTables();
  bindAllImages();
  bindEmbedBlocks();
  renderLiveEmbeds();
  highlightAllCodeBlocks();
  updateStats();
  updateWindowTitle();
  markDirty();
  syncActiveProjectFile();
  state.restoringSnippetSnapshot = false;
  return true;
}

function performUndo() {
  const before = editor.innerHTML;
  document.execCommand('undo', false, null);
  requestAnimationFrame(() => {
    if (editor.innerHTML === before) restoreSnippetUndoSnapshot();
    updateToolbarButtonActiveStates();
    updateStats();
    markDirty();
    syncActiveProjectFile();
    editor.focus();
  });
}

function insertTabSpaces() {
  const spaces = "    ";
  if (state.savedRange) {
    restoreSelection();
    const r = state.savedRange;
    r.deleteContents();
    const node = document.createTextNode(spaces);
    r.insertNode(node);
    r.setStartAfter(node);
    r.setEndAfter(node);
    saveSelection();
  } else {
    document.execCommand('insertText', false, spaces);
  }
}

// ─────────────────────────────────────────────
// TOOLBAR
// ─────────────────────────────────────────────

// Actual CSS font stacks for each named family.
// We write these directly into the CSS variable instead of using nested
// var() references, which WebKit does not resolve reliably from JS.
const FONT_STACKS = {
  // ── Serif ────────────────────────────────────────────────────────────────
  serif:    'Georgia, "Times New Roman", serif',
  palatino: '"Palatino Linotype", Palatino, "Book Antiqua", serif',
  times:    '"Times New Roman", Times, serif',
  charter:  'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif',
  baskerville: 'Baskerville, "Baskerville Old Face", "Hoefler Text", Garamond, serif',
  // ── Sans-serif ───────────────────────────────────────────────────────────
  system:   'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  helvetica:'"Helvetica Neue", Helvetica, Arial, sans-serif',
  optima:   'Optima, Candara, "Noto Sans", sans-serif',
  avenir:   'Avenir, "Avenir Next", Montserrat, system-ui, sans-serif',
  // ── Monospace ────────────────────────────────────────────────────────────
  mono:     'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  courier:  '"Courier New", Courier, monospace'
};

function setupToolbar() {
  // Rich-text format commands
  document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      const cmd = btn.getAttribute('data-command');
      if (cmd === 'undo') performUndo();
      else if (cmd === 'formatBlockquote') insertBlockquote();
      else document.execCommand(cmd, false, null);
      if (cmd === 'undo' || cmd === 'redo') markDirty();
      updateToolbarButtonActiveStates();
      updateStats();
      editor.focus();
    });
  });

  if (formatBlockSelect) {
    formatBlockSelect.addEventListener('change', () => {
      document.execCommand('formatBlock', false, `<${formatBlockSelect.value}>`);
      editor.focus();
      updateStats();
    });
  }

  // ── Font family ──────────────────────────────────────────────────────────
  const toolbarFont = document.getElementById('toolbar-font');
  if (toolbarFont) {
    toolbarFont.value = state.settings.editorFont;

    toolbarFont.addEventListener('change', () => {
      const key   = toolbarFont.value;            // 'serif' | 'system' | 'mono'
      const stack = FONT_STACKS[key] || FONT_STACKS.serif;

      state.settings.editorFont = key;
      persistSettings();

      // If the user has text selected, apply the font to just that selection;
      // otherwise the global CSS-variable change is enough.
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && editor.contains(sel.anchorNode)) {
        restoreSelection();
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('fontName', false, stack);
        document.execCommand('styleWithCSS', false, false); // restore default
      }

      // Always update the global editor baseline (affects all un-styled text)
      applySettings();
      markDirty();

      // Return focus to editor so typing continues normally
      restoreSelection();
      editor.focus();
    });
  }

  // ── Font size − / + ──────────────────────────────────────────────────────
  const sizeDisplay = document.getElementById('toolbar-font-size-display');
  const decBtn      = document.getElementById('toolbar-font-dec');
  const incBtn      = document.getElementById('toolbar-font-inc');

  const FONT_MIN = 10;
  const FONT_MAX = 72;
  const clampSize = sz => Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(sz)));

  // Return the computed font-size (px integer) at the current selection start,
  // or fall back to the global editor setting.
  const selectionFontSize = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const node = sel.getRangeAt(0).startContainer;
      const el   = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      if (el && editor.contains(el)) {
        const px = parseFloat(getComputedStyle(el).fontSize);
        if (px > 0) return Math.round(px);
      }
    }
    return state.settings.fontSize;
  };

  // Apply a size delta (+1 / -1).  When text is selected, reads the
  // selection's *actual* computed size so repeated presses keep incrementing
  // from the current rendered size rather than jumping back to the global value.
  const stepSize = (delta) => {
    restoreSelection();
    const sel     = window.getSelection();
    const hasSel  = sel && sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode);
    const base    = hasSel ? selectionFontSize() : state.settings.fontSize;
    const newSize = clampSize(base + delta);
    if (newSize === base && hasSel) return;  // already at limit

    if (hasSel) {
      restoreSelection();
      const range = sel.getRangeAt(0);
      const span  = document.createElement('span');
      span.style.fontSize = `${newSize}px`;
      try {
        // surroundContents wraps in-place — no extract/reinsert, so no
        // whitespace or newline artefacts.  Throws for cross-element ranges.
        range.surroundContents(span);
        const nr = document.createRange();
        nr.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(nr);
      } catch (_) {
        // Complex multi-element selection: only apply the global baseline.
      }
    }

    // Always sync global baseline so new/unstyled text matches
    state.settings.fontSize = newSize;
    persistSettings();
    applySettings();
    if (sizeDisplay) sizeDisplay.textContent = `${newSize}px`;
    markDirty();
    editor.focus();
  };

  if (decBtn) decBtn.addEventListener('mousedown', e => { e.preventDefault(); stepSize(-1); });
  if (incBtn) incBtn.addEventListener('mousedown', e => { e.preventDefault(); stepSize(+1); });
}

// ─────────────────────────────────────────────
// COLOUR PICKERS
// ─────────────────────────────────────────────
const TEXT_COLORS = [
  '#1a202c', '#e53e3e', '#dd6b20', '#d69e2e',
  '#38a169', '#3182ce', '#805ad5', '#d53f8c',
  '#2d3748', '#718096', '#e2e8f0', '#ffffff'
];
const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fde68a',
  '#fecaca', '#e9d5ff', '#fbcfe8', '#fed7aa',
  'clear'
];

function setupColorPickers() {
  const textBtn     = document.getElementById('btn-text-color');
  const textPalette = document.getElementById('text-color-palette');
  const textBar     = document.getElementById('text-color-bar');
  const hlBtn       = document.getElementById('btn-highlight-color');
  const hlPalette   = document.getElementById('highlight-color-palette');
  const hlBar       = document.getElementById('highlight-color-bar');
  if (!textBtn || !textPalette || !hlBtn || !hlPalette) return;

  function closePalettes() {
    textPalette.classList.remove('active');
    hlPalette.classList.remove('active');
  }

  // Populate text-colour palette
  TEXT_COLORS.forEach(color => {
    const swatch = document.createElement('button');
    swatch.className = 'color-swatch';
    swatch.style.background = color;
    swatch.title = color;
    swatch.addEventListener('mousedown', e => {
      e.preventDefault(); // preserve selection
      restoreSelection();
      document.execCommand('foreColor', false, color);
      if (textBar) textBar.style.background = color;
      closePalettes();
      editor.focus();
    });
    textPalette.appendChild(swatch);
  });

  // Populate highlight palette
  HIGHLIGHT_COLORS.forEach(color => {
    const swatch = document.createElement('button');
    swatch.className = `color-swatch${color === 'clear' ? ' is-clear' : ''}`;
    if (color !== 'clear') swatch.style.background = color;
    swatch.title = color === 'clear' ? 'Remove highlight' : color;
    swatch.addEventListener('mousedown', e => {
      e.preventDefault();
      restoreSelection();
      if (color === 'clear') {
        // Remove background — try both commands for cross-browser compat
        document.execCommand('hiliteColor', false, 'transparent');
        document.execCommand('backColor',   false, 'transparent');
      } else {
        // hiliteColor wraps only the selection; backColor fills whole block
        document.execCommand('hiliteColor', false, color);
      }
      if (hlBar) hlBar.style.background = color === 'clear' ? '#fef08a' : color;
      closePalettes();
      editor.focus();
    });
    hlPalette.appendChild(swatch);
  });

  // Toggle text-colour palette
  textBtn.addEventListener('mousedown', e => {
    e.preventDefault();
    saveSelection();
    const wasOpen = textPalette.classList.contains('active');
    closePalettes();
    if (!wasOpen) textPalette.classList.add('active');
  });

  // Toggle highlight palette
  hlBtn.addEventListener('mousedown', e => {
    e.preventDefault();
    saveSelection();
    const wasOpen = hlPalette.classList.contains('active');
    closePalettes();
    if (!wasOpen) hlPalette.classList.add('active');
  });

  // Close when clicking outside both pickers
  document.addEventListener('mousedown', e => {
    if (!e.target.closest('.color-btn-wrap')) closePalettes();
  });
}

function updateToolbarButtonActiveStates() {
  document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
    const cmd = btn.getAttribute('data-command');
    if (['removeFormat','formatBlockquote'].includes(cmd)) return;

    if (cmd === 'undo' || cmd === 'redo') {
      // Reflect whether undo/redo is currently possible
      try {
        const enabled = document.queryCommandEnabled(cmd);
        btn.classList.toggle('toolbar-btn-disabled', !enabled);
        btn.disabled = !enabled;
      } catch(e) {}
      return;
    }

    try {
      btn.classList.toggle('active', document.queryCommandState(cmd));
    } catch(e) {}
  });
}

function insertBlockquote() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const r = sel.getRangeAt(0);
  const text = r.toString() || "Inspiring quote text...";
  const bq = document.createElement('blockquote');
  bq.innerHTML = `&ldquo;${text}&rdquo;`;
  r.deleteContents();
  r.insertNode(bq);
  const p = document.createElement('p');
  p.innerHTML = '<br>';
  bq.after(p);
  const nr = document.createRange();
  nr.setStart(p, 0);
  nr.collapse(true);
  sel.removeAllRanges();
  sel.addRange(nr);
  saveSelection();
}

// ─────────────────────────────────────────────
// LINE NUMBERS
// ─────────────────────────────────────────────
function createLineNums(pre, codeEl) {
  // Only create once per pre
  if (pre.querySelector('.line-nums')) return pre.querySelector('.line-nums');
  const ln = document.createElement('div');
  ln.className = 'line-nums';
  ln.setAttribute('aria-hidden', 'true');
  pre.insertBefore(ln, codeEl);
  updateLineNums(ln, codeEl);
  return ln;
}

function updateLineNums(ln, codeEl) {
  const lines = (codeEl.textContent || '').split('\n');
  // Always show at least 1 line
  const count = Math.max(1, lines.length);
  ln.innerHTML = Array.from({ length: count }, (_, i) =>
    `<span>${i + 1}</span>`
  ).join('');
}

function refreshCodeLineNums(codeEl) {
  const pre = codeEl && codeEl.closest('pre');
  if (!pre) return;
  const ln = createLineNums(pre, codeEl);
  updateLineNums(ln, codeEl);
}

// ─────────────────────────────────────────────
// SYNTAX HIGHLIGHTING HELPERS
// ─────────────────────────────────────────────
function highlightAllCodeBlocks() {
  document.querySelectorAll('code[class*="language-"]').forEach(el => Prism.highlightElement(el));
}

function cleanEditorCloneForStorage() {
  const clone = editor.cloneNode(true);
  clone.querySelectorAll('.frank-task-check').forEach(input => {
    input.replaceWith(document.createTextNode(input.checked ? '[x] ' : '[ ] '));
  });
  clone.querySelectorAll('.callout-label').forEach(label => {
    const block = label.closest('.frank-callout');
    const kind = block?.classList.contains('callout-warning') ? 'WARNING' : block?.classList.contains('callout-tip') ? 'TIP' : 'NOTE';
    label.replaceWith(document.createTextNode(`[!${kind}] `));
  });
  clone.querySelectorAll('.frank-footnote-ref').forEach(ref => {
    ref.replaceWith(document.createTextNode(`[^${ref.dataset.footnoteId || ref.textContent || '1'}]`));
  });
  clone.querySelectorAll('.frank-footnote-source-hidden').forEach(el => el.classList.remove('frank-footnote-source-hidden'));
  clone.querySelectorAll('[data-live-render], mark.frank-hit').forEach(el => {
    if (el.matches && el.matches('mark.frank-hit')) el.replaceWith(document.createTextNode(el.textContent));
    else el.remove();
  });
  clone.normalize();
  return clone;
}

// Save/restore character offset inside a contenteditable for post-highlight caret position
function getCaretCharOffset(el) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return 0;
  const r = sel.getRangeAt(0).cloneRange();
  r.selectNodeContents(el);
  r.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
  return r.toString().length;
}

function setCaretCharOffset(el, offset) {
  ensureCodeCaretAnchor(el);
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let rem = offset;
  let node;
  while ((node = walker.nextNode())) {
    if (rem <= node.textContent.length) {
      const r = document.createRange();
      r.setStart(node, rem);
      r.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      return;
    }
    rem -= node.textContent.length;
  }
  placeCursorInsideCodeBlock(el);
}

// Insert raw text at the current caret position (no block wrapping)
function insertTextAtCaret(text) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const r = sel.getRangeAt(0);
  r.deleteContents();
  if (r.startContainer.nodeType === Node.TEXT_NODE && r.startContainer.textContent === '\u200b') {
    r.startContainer.textContent = '';
  }
  const node = document.createTextNode(text);
  r.insertNode(node);
  r.setStartAfter(node);
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
}

// Bind Enter + Tab handling to a code block so they don't bubble to the
// main editor handler (which would insert block elements instead of \n/spaces)
function bindCodeBlockKeydown(codeEl) {
  if (codeEl.dataset.kbBound) return; // guard against double-binding
  codeEl.dataset.kbBound = '1';
  codeEl.addEventListener('focus', () => ensureCodeCaretAnchor(codeEl));
  codeEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key === ' ') || (e.metaKey && e.key.toLowerCase() === 'j')) {
      e.preventDefault();
      e.stopPropagation();
      openSnippetPalette(codeEl);
      return;
    }
    if (handleCodeAutocomplete(e, codeEl)) return;
    if (e.key !== 'Enter' && e.key !== 'Tab') return;
    e.preventDefault();
    e.stopPropagation(); // stop the main editor handler from seeing this
    insertTextAtCaret(e.key === 'Tab' ? '    ' : '\n');
    refreshCodeLineNums(codeEl);
    const inputEvent = typeof InputEvent === 'function'
      ? new InputEvent('input', {
          bubbles: true,
          inputType: e.key === 'Tab' ? 'insertText' : 'insertLineBreak',
          data: e.key === 'Tab' ? '    ' : '\n'
        })
      : new Event('input', { bubbles: true });
    codeEl.dispatchEvent(inputEvent);
    markDirty();
    updateStats();
  });
}

function handleCodeAutocomplete(e, codeEl) {
  if (e.metaKey || e.ctrlKey || e.altKey) return false;
  const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
  if (!pairs[e.key]) return false;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !codeEl.contains(sel.anchorNode)) return false;
  e.preventDefault();
  e.stopPropagation();
  const selected = sel.toString();
  insertTextAtCaret(`${e.key}${selected}${pairs[e.key]}`);
  if (!selected) setCaretCharOffset(codeEl, Math.max(0, getCaretCharOffset(codeEl) - 1));
  refreshCodeLineNums(codeEl);
  codeEl.dispatchEvent(new Event('input', { bubbles: true }));
  markDirty();
  return true;
}

function bindHighlightListeners(codeEl) {
  if (codeEl.dataset.hlBound) return; // guard against double-binding
  codeEl.dataset.hlBound = '1';

  const reHighlight = debounce(() => {
    // Capture offset before any DOM mutation
    const offset  = getCaretCharOffset(codeEl);
    const rawText = (codeEl.textContent || '').replace(/\u200b/g, '');

    // Replace innerHTML via Prism (textContent= then highlightElement)
    codeEl.textContent = rawText;
    codeEl.dataset.empty = rawText ? 'false' : 'true';
    Prism.highlightElement(codeEl);

    // Refresh line numbers
    refreshCodeLineNums(codeEl);

    // Restore caret; fall back to end-of-block if offset restore fails
    try {
      if (offset > 0) setCaretCharOffset(codeEl, offset);
      else            placeCursorInsideCodeBlock(codeEl);
    } catch(e) {
      placeCursorInsideCodeBlock(codeEl);
    }
  }, 650);

  codeEl.addEventListener('input', reHighlight);
  codeEl.addEventListener('input', scheduleLiveRender);
}

function placeCaretAtEnd(el) {
  el.focus();
  const sel = window.getSelection();
  const r   = document.createRange();
  r.selectNodeContents(el);
  r.collapse(false);
  sel.removeAllRanges();
  sel.addRange(r);
}

// ─────────────────────────────────────────────
// SNIPPET PALETTE
// ─────────────────────────────────────────────
function setupSnippetPalette() {
  state.filteredSnippets = [...snippetCatalog];
  renderSnippetList();

  if (toolbarInsertSnippet) {
    toolbarInsertSnippet.addEventListener('click', e => { e.preventDefault(); openSnippetPalette(); });
  }

  paletteSearch.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    state.filteredSnippets = q === ''
      ? [...snippetCatalog]
      : snippetCatalog.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.lang.toLowerCase().includes(q) ||
          s.tags.some(t => t.toLowerCase().includes(q)));
    state.activeSnippetIndex = 0;
    renderSnippetList();
  });

  snippetModal.addEventListener('keydown', e => {
    const items = paletteResults.querySelectorAll('.snippet-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); state.activeSnippetIndex = (state.activeSnippetIndex + 1) % items.length; updateActivePaletteItem(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); state.activeSnippetIndex = (state.activeSnippetIndex - 1 + items.length) % items.length; updateActivePaletteItem(); }
    else if (e.key === 'Enter') { e.preventDefault(); injectSelectedSnippet(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeSnippetPalette(); }
  });

  snippetModal.addEventListener('click', e => { if (e.target === snippetModal) closeSnippetPalette(); });
}

function openSnippetPalette(targetCodeEl = null) {
  saveSelection();
  state.snippetTargetCodeEl = targetCodeEl && document.contains(targetCodeEl) ? targetCodeEl : null;
  snippetModal.classList.add('active');
  paletteSearch.value = '';
  state.filteredSnippets = [...snippetCatalog];
  state.activeSnippetIndex = 0;
  renderSnippetList();
  setTimeout(() => paletteSearch.focus(), 50);
}

function openSnippetPaletteForLanguage(lang) {
  saveSelection();
  const key = String(lang || '').toLowerCase();
  state.snippetTargetCodeEl = null;
  snippetModal.classList.add('active');
  paletteSearch.value = key;
  state.filteredSnippets = snippetCatalog.filter(s =>
    s.lang.toLowerCase() === key ||
    s.tags.some(t => t.toLowerCase() === key)
  );
  if (!state.filteredSnippets.length) state.filteredSnippets = [...snippetCatalog];
  state.activeSnippetIndex = 0;
  renderSnippetList();
  setTimeout(() => paletteSearch.focus(), 50);
}

function closeSnippetPalette() {
  snippetModal.classList.remove('active');
  state.snippetTargetCodeEl = null;
  restoreSelection();
  editor.focus();
}

function renderSnippetList() {
  paletteResults.innerHTML = '';

  if (!state.filteredSnippets.length) {
    paletteResults.innerHTML = `<div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:.85rem;">No templates match. Try 'js', 'python', 'sort', or 'flex'.</div>`;
    palettePreview.classList.remove('visible');
    return;
  }

  state.filteredSnippets.forEach((s, idx) => {
    const item = document.createElement('div');
    item.className = `snippet-item${idx === state.activeSnippetIndex ? ' selected' : ''}`;
    item.innerHTML = `
      <div class="snippet-info">
        <span class="snippet-name">${escapeHTML(s.name)}</span>
        <span class="snippet-desc">${escapeHTML(s.desc)}</span>
      </div>
      <span class="snippet-lang-pill">${escapeHTML(s.lang)}</span>`;
    item.addEventListener('click', () => { state.activeSnippetIndex = idx; updateActivePaletteItem(); injectSelectedSnippet(); });
    item.addEventListener('mouseenter', () => { state.activeSnippetIndex = idx; updateActivePaletteItem(false); });
    paletteResults.appendChild(item);
  });

  updateActivePaletteItem();
}

function updateActivePaletteItem(scroll = true) {
  const items = paletteResults.querySelectorAll('.snippet-item');
  items.forEach((item, idx) => {
    const active = idx === state.activeSnippetIndex;
    item.classList.toggle('selected', active);
    if (active) {
      if (scroll) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const s = state.filteredSnippets[idx];
      if (s) {
        palettePreviewCode.className = `language-${s.lang}`;
        palettePreviewCode.textContent = s.code;
        palettePreview.classList.add('visible');
        Prism.highlightElement(palettePreviewCode);
      }
    }
  });
}

function injectSelectedSnippet() {
  const snippet = state.filteredSnippets[state.activeSnippetIndex];
  if (!snippet) return;

  if (state.snippetTargetCodeEl && document.contains(state.snippetTargetCodeEl)) {
    pushSnippetUndoSnapshot();
    const code = state.snippetTargetCodeEl;
    const wrapper = code.closest('.code-block-wrapper');
    code.textContent = snippet.code;
    code.className = `language-${snippet.lang}`;
    const langTag = wrapper && wrapper.querySelector('.code-lang-tag');
    if (langTag) langTag.textContent = snippet.lang;
    Prism.highlightElement(code);
    refreshCodeLineNums(code);
    snippetModal.classList.remove('active');
    state.snippetTargetCodeEl = null;
    placeCaretAtEnd(code);
    markDirty();
    updateStats();
    scheduleLiveRender();
    return;
  }

  // Build wrapper
  pushSnippetUndoSnapshot();
  const wrapper = document.createElement('div');
  wrapper.className = 'code-block-wrapper';
  wrapper.setAttribute('contenteditable', 'false');

  const header = document.createElement('div');
  header.className = 'code-header';

  const langTag = document.createElement('span');
  langTag.className = 'code-lang-tag';
  langTag.textContent = snippet.lang;

  const fileInput = document.createElement('input');
  fileInput.className = 'code-file-input';
  fileInput.placeholder = 'filename.ext';
  fileInput.setAttribute('aria-label', 'Code filename or caption');

  const actions = document.createElement('div');
  actions.className = 'code-actions';

  const lineBtn = document.createElement('button');
  lineBtn.className = 'code-action-btn';
  lineBtn.innerHTML = `Line #`;
  lineBtn.addEventListener('click', e => { e.stopPropagation(); wrapper.classList.toggle('hide-line-nums'); markDirty(); });

  const collapseBtn = document.createElement('button');
  collapseBtn.className = 'code-action-btn';
  collapseBtn.innerHTML = `Collapse`;
  collapseBtn.addEventListener('click', e => {
    e.stopPropagation();
    wrapper.classList.toggle('is-collapsed');
    collapseBtn.textContent = wrapper.classList.contains('is-collapsed') ? 'Expand' : 'Collapse';
    markDirty();
  });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'code-action-btn copy-btn';
  copyBtn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`;
  copyBtn.addEventListener('click', e => { e.stopPropagation(); performCopyCode(wrapper.querySelector('code'), copyBtn); });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'code-action-btn danger';
  deleteBtn.dataset.codeAction = 'delete';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', e => {
    e.stopPropagation();
    deleteCodeBlock(wrapper);
  });

  actions.appendChild(lineBtn);
  actions.appendChild(collapseBtn);
  actions.appendChild(deleteBtn);
  actions.appendChild(copyBtn);
  header.appendChild(langTag);
  header.appendChild(fileInput);
  header.appendChild(actions);

  const pre  = document.createElement('pre');
  const code = document.createElement('code');
  code.className = `language-${snippet.lang}`;
  code.setAttribute('contenteditable', 'true');
  code.setAttribute('spellcheck', 'false');
  code.setAttribute('data-placeholder', 'Start typing...');
  // Blank on insert — user writes their own code; palette preview shows the template
  code.textContent = '';

  pre.appendChild(code);
  wrapper.appendChild(header);
  wrapper.appendChild(pre);

  snippetModal.classList.remove('active');
  restoreSelection();

  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    const r = sel.getRangeAt(0);
    r.deleteContents();
    r.insertNode(wrapper);
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    wrapper.after(p);
  } else {
    editor.appendChild(wrapper);
  }

  // Highlight BEFORE focusing — Prism replaces innerHTML which destroys
  // any cursor set beforehand, so we must colour first, then place cursor.
  Prism.highlightElement(code);
  createLineNums(pre, code);
  bindHighlightListeners(code);
  bindCodeBlockKeydown(code);
  placeCursorInsideCodeBlock(code);

  code.addEventListener('input', markDirty);
  markDirty();
  updateStats();
}

function placeCursorInsideCodeBlock(code) {
  code.focus();
  ensureCodeCaretAnchor(code);
  const sel = window.getSelection();
  const r   = document.createRange();
  if ((code.textContent || '').replace(/\u200b/g, '').length === 0) {
    const anchor = code.firstChild && code.firstChild.nodeType === Node.TEXT_NODE
      ? code.firstChild
      : code.appendChild(document.createTextNode('\u200b'));
    anchor.textContent = '\u200b';
    code.dataset.empty = 'true';
    r.setStart(anchor, anchor.textContent.length);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    return;
  }
  r.selectNodeContents(code);
  r.collapse(false);
  sel.removeAllRanges();
  sel.addRange(r);
  saveSelection();
}

function ensureCodeCaretAnchor(code) {
  if (!code || !code.matches || !code.matches('.code-block-wrapper code')) return;
  const visibleText = (code.textContent || '').replace(/\u200b/g, '');
  if (visibleText.length > 0) {
    code.dataset.empty = 'false';
    return;
  }
  code.textContent = '\u200b';
  code.dataset.empty = 'true';
}

// ─────────────────────────────────────────────
// MARKDOWN IMPORT
// ─────────────────────────────────────────────

/** Escape HTML entities in a raw string */
function _escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/** Apply inline markdown formatting to an already-HTML-escaped string */
function inlineMd(raw) {
  let s = _escHtml(raw);
  s = s
    .replace(/`([^`]+)`/g,                          '<code>$1</code>')
    .replace(/\*\*\*([^*]+)\*\*\*/g,                '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*\n]+)\*\*/g,                  '<strong>$1</strong>')
    .replace(/__([^_\n]+)__/g,                      '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g,                      '<em>$1</em>')
    .replace(/_([^_\s][^_\n]*)_/g,                  '<em>$1</em>')
    .replace(/~~([^~\n]+)~~/g,                      '<strike>$1</strike>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,            '<a href="$2">$1</a>');
  return s;
}

/** Build the frank code-block wrapper HTML for a given language + code text */
function mdCodeBlockHTML(lang, codeText) {
  const safeLang = (lang || 'text').replace(/[^a-z0-9+#-]/gi, '') || 'text';
  const safeCode = _escHtml(codeText);
  return (
    `<div class="code-block-wrapper" contenteditable="false">` +
    `<div class="code-header">` +
    `<span class="code-lang-tag">${safeLang}</span>` +
    `<input class="code-file-input" placeholder="filename.ext" aria-label="Code filename or caption">` +
    `<div class="code-actions">` +
    `<button class="code-action-btn" data-code-action="lines">Line #</button>` +
    `<button class="code-action-btn" data-code-action="collapse">Collapse</button>` +
    `<button class="code-action-btn danger" data-code-action="delete">Delete</button>` +
    `<button class="code-action-btn copy-btn">` +
    `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>` +
    `<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy` +
    `</button></div></div>` +
    `<pre><code class="language-${safeLang}" contenteditable="true" spellcheck="false"` +
    ` data-placeholder="Start typing...">${safeCode}</code></pre>` +
    `</div>`
  );
}

/**
 * Parse a Markdown string into frank editor HTML.
 * Supports: H1–H3, fenced code blocks, blockquotes, UL, OL,
 *           thematic breaks, and paragraphs with inline formatting.
 */
function markdownToEditorHTML(md) {
  const lines = (md || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const out   = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block (``` lang) ─────────────────────────────────────
    const fenceOpen = line.match(/^```(\S*)\s*$/);
    if (fenceOpen) {
      const lang      = fenceOpen[1] || 'text';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```
      out.push(mdCodeBlockHTML(lang, codeLines.join('\n')));
      continue;
    }

    // ── ATX headings (# ## ###) ───────────────────────────────────────────
    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      const lvl = hMatch[1].length;
      out.push(`<h${lvl}>${inlineMd(hMatch[2].trim())}</h${lvl}>`);
      i++; continue;
    }

    // ── Blockquote (> ...) ────────────────────────────────────────────────
    if (line.match(/^>\s?/)) {
      const bqParts = [];
      while (i < lines.length && lines[i].match(/^>\s?/)) {
        bqParts.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${inlineMd(bqParts.join(' '))}</blockquote>`);
      continue;
    }

    // ── Unordered list (- * +) ────────────────────────────────────────────
    if (line.match(/^[-*+]\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*+]\s/)) {
        items.push(`<li>${inlineMd(lines[i].replace(/^[-*+]\s/, ''))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // ── Ordered list (1. 2. …) ───────────────────────────────────────────
    if (line.match(/^\d+\.\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(`<li>${inlineMd(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // ── Thematic break (--- *** ___) ─────────────────────────────────────
    if (line.match(/^[-*_]{3,}\s*$/)) {
      out.push('<hr>'); i++; continue;
    }

    // ── Blank line ────────────────────────────────────────────────────────
    if (line.trim() === '') { i++; continue; }

    // ── Paragraph (soft-wrap continuation lines) ──────────────────────────
    const paraLines = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^(#{1,3}\s|```|[-*+]\s|\d+\.\s|>\s?|[-*_]{3,}\s*$)/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    out.push(`<p>${inlineMd(paraLines.join(' '))}</p>`);
  }

  return out.length ? out.join('') : '<p><br></p>';
}

/**
 * Load a Markdown string into the active tab.
 * Derives the document title from the first H1 (or the filename).
 */
function loadMarkdownDocument(md, filePath = null) {
  const h1 = md.match(/^#\s+(.+)/m);
  const title = h1
    ? h1[1].trim()
    : (filePath ? filePath.split('/').pop().replace(/\.md$/i, '') : 'Imported');

  documentTitle.value = title;
  editor.innerHTML    = markdownToEditorHTML(md);
  state.filePath      = filePath;
  state.isDirty       = false;

  // Clear serialised binding guards so listeners re-attach cleanly
  editor.querySelectorAll('[data-kb-bound]').forEach(el => delete el.dataset.kbBound);
  editor.querySelectorAll('[data-hl-bound]').forEach(el => delete el.dataset.hlBound);

  highlightAllCodeBlocks();
  bindEmbeddedCopyButtons();
  bindAllCodeBlocks();
  bindAllTables();
  bindAllImages();
  bindEmbedBlocks();
  renderLiveEmbeds();
  updateStats();
  updateWindowTitle();
  updatePageGuides();
  setSaveStatus('Markdown imported');

  const tab = activeProjectFile() || tabs.find(t => t.id === activeTabId);
  if (tab) {
    tab.title    = title;
    tab.html     = editor.innerHTML;
    tab.isDirty  = false;
    tab.filePath = filePath;
    if (activeProjectFile()) {
      state.activeProjectFileId = tab.id;
      activeTabId = tab.id;
      persistProjects();
      renderProjectPanel();
    }
    renderTabs();
  }
}

// ─────────────────────────────────────────────
// CLIPBOARD
// ─────────────────────────────────────────────
function performCopyCode(codeNode, btn) {
  if (!codeNode) return;
  navigator.clipboard.writeText(codeNode.textContent).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg viewBox="0 0 24 24" style="stroke:#10b981"><polyline points="20 6 9 17 4 12"></polyline></svg><span style="color:#10b981">Copied!</span>`;
    setTimeout(() => { btn.innerHTML = orig; }, 1800);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = codeNode.textContent;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = "Copy"; }, 1500);
  });
}

function bindEmbeddedCopyButtons() {
  document.querySelectorAll('.code-block-wrapper').forEach(addCodeDeleteButton);

  document.querySelectorAll('.copy-btn:not([data-action-bound])').forEach(btn => {
    btn.dataset.actionBound = '1';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const wrapper = btn.closest('.code-block-wrapper');
      if (wrapper) performCopyCode(wrapper.querySelector('code'), btn);
    });
  });

  document.querySelectorAll('[data-code-action]:not([data-action-bound])').forEach(btn => {
    btn.dataset.actionBound = '1';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const wrapper = btn.closest('.code-block-wrapper');
      if (!wrapper) return;
      if (btn.dataset.codeAction === 'lines') wrapper.classList.toggle('hide-line-nums');
      if (btn.dataset.codeAction === 'collapse') {
        wrapper.classList.toggle('is-collapsed');
        btn.textContent = wrapper.classList.contains('is-collapsed') ? 'Expand' : 'Collapse';
      }
      if (btn.dataset.codeAction === 'delete') {
        deleteCodeBlock(wrapper);
        return;
      }
      markDirty();
    });
  });

  document.querySelectorAll('.code-empty-action').forEach(btn => btn.remove());
}

function addCodeDeleteButton(wrapper) {
  if (!wrapper || wrapper.querySelector('[data-code-action="delete"]')) return;
  const actions = wrapper.querySelector('.code-actions');
  if (!actions) return;
  const btn = document.createElement('button');
  btn.className = 'code-action-btn danger';
  btn.dataset.codeAction = 'delete';
  btn.textContent = 'Delete';
  const copy = actions.querySelector('.copy-btn');
  if (copy) actions.insertBefore(btn, copy);
  else actions.appendChild(btn);
}

function deleteCodeBlock(wrapper) {
  if (!wrapper || !editor.contains(wrapper)) return;
  const replacement = document.createElement('p');
  replacement.innerHTML = '<br>';
  wrapper.replaceWith(replacement);
  placeCaretAtEnd(replacement);
  markDirty();
  syncActiveProjectFile();
  updateStats();
  updatePageGuides();
}

// Bind Enter/Tab + highlight listeners to every code block in the document.
// Safe to call multiple times — guards against double-binding via data attribute.
function bindAllCodeBlocks() {
  document.querySelectorAll('.code-block-wrapper code[contenteditable]').forEach(codeEl => {
    bindCodeBlockKeydown(codeEl);
    bindHighlightListeners(codeEl);
    // Ensure line numbers exist for this block
    const pre = codeEl.closest('pre');
    if (pre) createLineNums(pre, codeEl);
  });
  bindEmbeddedCopyButtons();
}

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────
function updateStats() {
  const clone = editor.cloneNode(true);
  // Strip non-content nodes before counting
  clone.querySelectorAll('.line-nums, .frank-img-caption, .frank-img-resize-handle, .code-actions, [data-live-render]').forEach(el => el.remove());
  // Unwrap search highlights so text isn't double-counted
  clone.querySelectorAll('mark.frank-hit').forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
  const text  = clone.textContent || "";
  const clean = text.replace(/[\s]+/g, ' ').trim();
  const words = clean === '' ? 0 : clean.split(' ').length;
  statWords.textContent   = `Words: ${words}`;
  statChars.textContent   = `Characters: ${text.length}`;
  statReading.textContent = `Reading Time: ${Math.max(1, Math.ceil(words / 200))} min`;
  if (floatingWords) floatingWords.textContent = String(words);
  if (floatingChars) floatingChars.textContent = String(text.length);
}

// ─────────────────────────────────────────────
// PAGE BREAK GUIDES
// ─────────────────────────────────────────────
// Approximate content height of one US-Letter page at 96 dpi with 54px top/bottom margins.
// This is a visual guide only — the native PDF bridge renders at actual page dimensions.
const PAGE_GUIDE_H = 960;

const _updatePageGuides = debounce(() => {
  if (state.isFocusMode) {
    const ol = document.getElementById('page-guides-overlay');
    if (ol) ol.innerHTML = '';
    return;
  }

  const workspace = document.querySelector('.editor-workspace');
  const paper     = document.querySelector('.paper');
  if (!workspace || !paper) return;

  // The workspace must be the positioning parent
  workspace.style.position = 'relative';

  let overlay = document.getElementById('page-guides-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'page-guides-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    workspace.appendChild(overlay);
  }

  const top    = paper.offsetTop;
  const left   = paper.offsetLeft;
  const width  = paper.offsetWidth;
  const height = paper.offsetHeight;

  overlay.style.cssText =
    `position:absolute;top:${top}px;left:${left}px;` +
    `width:${width}px;height:${height}px;` +
    `pointer-events:none;z-index:2;overflow:hidden;`;

  let html = '';
  for (let y = PAGE_GUIDE_H; y < height; y += PAGE_GUIDE_H) {
    const page = Math.floor(y / PAGE_GUIDE_H) + 1;
    html += `<div class="pgb" style="top:${y}px">` +
            `<span class="pgb-label">page&nbsp;${page}</span></div>`;
  }
  overlay.innerHTML = html;
}, 200);

function updatePageGuides() { _updatePageGuides(); }

function setupPageGuides() {
  updatePageGuides();
  window.addEventListener('resize', updatePageGuides);
  editor.addEventListener('input', updatePageGuides);
}

// ─────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────
function setupThemeSystem() {
  themeToggleBtn && themeToggleBtn.addEventListener('click', toggleDarkMode);
  window.matchMedia?.('(prefers-color-scheme: dark)')?.addEventListener?.('change', () => {
    if (state.settings.followSystemTheme) applySettings();
  });
  updateThemeToggleIcon();
  focusBtn.addEventListener('click', () => toggleFocusMode(true));
  exitFocusBtn.addEventListener('click', () => toggleFocusMode(false));
}

function toggleFocusMode(enable) {
  state.isFocusMode = enable;
  document.body.classList.toggle('focus-mode', enable);
  updateFocusPanelState();
  updatePageGuides();
}

function updateFocusPanelState() {
  document.body.classList.toggle('focus-panel-open', state.isFocusMode && !state.projectPanelCollapsed);
  document.body.classList.toggle('focus-panel-closed', state.isFocusMode && state.projectPanelCollapsed);
}

// ─────────────────────────────────────────────
// DROPDOWNS
// ─────────────────────────────────────────────
function setupDropdownMenus() {
  exportDropdownBtn.addEventListener('click', e => { e.stopPropagation(); exportMenu.classList.toggle('active'); });
  document.addEventListener('click', () => exportMenu.classList.remove('active'));
}

// ─────────────────────────────────────────────
// FILE ACTIONS
// ─────────────────────────────────────────────
function setupFileActions() {
  fileSaveBtn.addEventListener('click', saveDocument);
  fileSaveAsBtn.addEventListener('click', saveDocumentAs);
  fileOpenBtn.addEventListener('click', openDocument);
  fileSettingsBtn.addEventListener('click', openSettings);

  document.addEventListener('keydown', e => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const k = e.key.toLowerCase();

    if (['a', 'c', 'x', 'v', 'z'].includes(k)) {
      closeSlashPopover();
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo();
        return;
      }
      requestAnimationFrame(() => {
        updateToolbarButtonActiveStates();
        updateStats();
        if (k === 'z') {
          markDirty();
          syncActiveProjectFile();
        }
      });
      return;
    }

    if (k === 'j' || (e.ctrlKey && e.key === ' ')) {
      e.preventDefault();
      closeSlashPopover();
      openSnippetPalette();
      return;
    }

    if (handleEditorShortcut(e, k)) return;

    if (k === 's') { e.preventDefault(); e.shiftKey ? saveDocumentAs() : saveDocument(); }
    else if (k === 'o') { e.preventDefault(); openDocument(); }
    else if (k === 'f') { e.preventDefault(); e.shiftKey ? openGlobalSearch() : openSearch(); }
    else if (k === 'k') { e.preventDefault(); openCommandPalette(); }
    else if (k === 'p') { e.preventDefault(); openCommandPalette(); }
    else if (k === ',') { e.preventDefault(); openSettings(); }
    else if (k === 't') { e.preventDefault(); newTab(); }
    else if (k === 'w') { e.preventDefault(); closeTab(activeTabId); }

    // Undo / Redo — JS fallback so toolbar state refreshes and markDirty fires
    else if (k === 'z' && !e.shiftKey) {
      // Let the native Edit menu / WKWebView handle the actual undo;
      // we only update toolbar state afterwards.
      requestAnimationFrame(updateToolbarButtonActiveStates);
    }
    else if ((k === 'z' && e.shiftKey) || k === 'y') {
      requestAnimationFrame(updateToolbarButtonActiveStates);
    }
  });

  window.frankNativeDidSave = (result) => {
    if (result && result.path) state.filePath = result.path;
    if (result && result.iCloud) {
      state.settings.folderSyncEnabled = true;
      state.settings.syncFolderPath = folderFromPath(result.path) || state.settings.syncFolderPath;
      persistSettings();
      syncSettingsControls();
    }
    state.isDirty = false;
    updateWindowTitle();
    setSaveStatus(result && result.autosave ? 'Autosaved' : 'Saved');
    const tab = activeProjectFile() || tabs.find(t => t.id === activeTabId);
    if (tab) { tab.isDirty = false; tab.filePath = state.filePath; renderTabs(); }
    syncActiveProjectFile();
  };

  window.frankNativeDidConfigureICloud = (result) => {
    if (!result) return;
    if (result.path) state.settings.syncFolderPath = result.path;
    if (typeof result.enabled === 'boolean') state.settings.folderSyncEnabled = result.enabled;
    persistSettings();
    syncSettingsControls();
    setSaveStatus(result.path ? 'Folder sync ready' : 'Folder sync unavailable');
  };

  window.frankNativeDidOpen = (result) => {
    if (!result || !result.content) return;
    const ext = (result.type || '').toLowerCase();
    if (ext === 'md' || ext === 'markdown') {
      loadMarkdownDocument(result.content, result.path || null);
    } else {
      loadFrankDocument(result.content, result.path || null);
    }
  };

  window.frankNativeDidFail = (msg) => { if (msg) setSaveStatus(msg); };
  window.frankNativeDidExport = (r) => { setSaveStatus(r && r.kind ? `${r.kind} exported` : 'Exported'); };
}

function folderFromPath(path) {
  const raw = String(path || '');
  const idx = raw.lastIndexOf('/');
  return idx > 0 ? raw.slice(0, idx) : '';
}

function handleEditorShortcut(e, k) {
  const hasEditorSelection = editorHasActiveSelection();

  if (!e.altKey && !e.shiftKey && ['x', 'c', 'v'].includes(k)) {
    const active = document.activeElement;
    const isEditable = active && (active === editor || editor.contains(active) || active.matches?.('input, textarea, [contenteditable="true"]'));
    if (!isEditable) return false;
    e.preventDefault();
    if (k === 'x') document.execCommand('cut');
    if (k === 'c') document.execCommand('copy');
    if (k === 'v') document.execCommand('paste');
    if (k !== 'c') {
      markDirty();
      requestAnimationFrame(() => {
        updateStats();
        syncActiveProjectFile();
      });
    }
    return true;
  }

  if (!hasEditorSelection) return false;

  if (k === 'k') {
    e.preventDefault();
    if (e.shiftKey) openCommandPalette();
    else insertPageLinkFromSelection();
    return true;
  }

  if (e.shiftKey && k === '/') {
    e.preventDefault();
    saveSelection();
    openSlashPopover();
    return true;
  }

  const simpleCommands = {
    b: 'bold',
    i: 'italic',
    u: 'underline'
  };
  if (!e.altKey && !e.shiftKey && simpleCommands[k]) {
    e.preventDefault();
    restoreSelection();
    document.execCommand(simpleCommands[k], false, null);
    editor.focus();
    markDirty();
    updateToolbarButtonActiveStates();
    updateFloatingContextToolbar();
    return true;
  }

  if (e.altKey && ['0', '1', '2', '3'].includes(k)) {
    e.preventDefault();
    const block = k === '0' ? 'p' : `h${k}`;
    restoreSelection();
    document.execCommand('formatBlock', false, `<${block}>`);
    editor.focus();
    markDirty();
    return true;
  }

  if (e.shiftKey && (k === '7' || k === '&')) {
    e.preventDefault();
    restoreSelection();
    document.execCommand('insertOrderedList', false, null);
    editor.focus();
    markDirty();
    return true;
  }

  if (e.shiftKey && (k === '8' || k === '*')) {
    e.preventDefault();
    restoreSelection();
    document.execCommand('insertUnorderedList', false, null);
    editor.focus();
    markDirty();
    return true;
  }

  if (e.altKey && k === 'c') {
    e.preventDefault();
    restoreSelection();
    insertEmptyCodeBlock('text');
    return true;
  }

  return false;
}

function editorHasActiveSelection() {
  const active = document.activeElement;
  if (active && active !== document.body && !editor.contains(active)) return false;
  const sel = window.getSelection();
  return Boolean(sel && sel.rangeCount && editor.contains(sel.getRangeAt(0).commonAncestorContainer));
}

function setupExports() {
  document.getElementById('export-md').addEventListener('click', exportToMarkdown);
  document.getElementById('export-doc').addEventListener('click', exportToWord);
  document.getElementById('export-pdf').addEventListener('click', exportToPDF);
  const publishBtn = document.getElementById('publish-url');
  if (publishBtn) publishBtn.addEventListener('click', publishToDataURL);
  const importMdBtn = document.getElementById('import-md');
  if (importMdBtn) importMdBtn.addEventListener('click', openDocument);
}

function saveDocument() {
  saveVersionSnapshot('manual save');
  syncActiveProjectFile();
  const content  = serializeFrankDocument();
  const filename = `${safeDocumentTitle()}.fm`;
  const posted = nativePost({
    action: 'saveFM',
    filename,
    content,
    path: state.filePath || '',
    iCloudSync: Boolean(state.settings.folderSyncEnabled),
    iCloudFolder: state.settings.syncFolderPath || ''
  });
  if (posted) {
    syncWorkspaceVaultToFolder({ autosave: false, skipActive: true });
    return;
  }
  localStorage.setItem('frank:lastDocument', content);
  state.isDirty = false;
  updateWindowTitle();
  setSaveStatus('Saved locally');
  const tab = activeProjectFile() || tabs.find(t => t.id === activeTabId);
  if (tab) { tab.isDirty = false; renderTabs(); }
  syncActiveProjectFile();
}

function saveDocumentAs() {
  saveVersionSnapshot('save as');
  const content  = serializeFrankDocument();
  const filename = `${safeDocumentTitle()}.fm`;
  if (nativePost({
    action: 'saveAsFM',
    filename,
    content,
    iCloudSync: Boolean(state.settings.folderSyncEnabled),
    iCloudFolder: state.settings.syncFolderPath || ''
  })) return;
  triggerFileDownload(content, 'application/json;charset=utf-8', '.fm');
}

function openDocument() {
  const bridge = window.webkit &&
                 window.webkit.messageHandlers &&
                 window.webkit.messageHandlers.openFileHandler;
  if (bridge) {
    bridge.postMessage({});
  } else {
    alert('File opening is available in the macOS app.');
  }
}

function autosaveDocument() {
  if (!state.settings.autosaveEnabled || !state.isDirty) return;
  saveVersionSnapshot('autosave');
  syncActiveProjectFile();
  const content = serializeFrankDocument();
  if (state.filePath && nativePost({ action: 'autosaveFM', filename: `${safeDocumentTitle()}.fm`, content, path: state.filePath })) return;
  const posted = nativePost({
    action: 'autosaveFM',
    filename: `${safeDocumentTitle()}.fm`,
    content,
    iCloudSync: Boolean(state.settings.folderSyncEnabled),
    iCloudFolder: state.settings.syncFolderPath || ''
  });
  if (posted) {
    syncWorkspaceVaultToFolder({ autosave: true, skipActive: true });
    return;
  }
  localStorage.setItem('frank:autosaveDraft', content);
  setSaveStatus('Draft autosaved');
}

function syncWorkspaceVaultToFolder({ autosave = true, skipActive = false } = {}) {
  if (!state.settings.folderSyncEnabled || !window.webkit?.messageHandlers?.appBridge) return;
  const activeFileId = state.activeProjectFileId;
  state.projects.forEach(project => {
    project.files.forEach(file => {
      if (skipActive && file.id === activeFileId) return;
      nativePost({
        action: autosave ? 'autosaveFM' : 'saveFM',
        filename: `${safeFilename(project.name || 'Workspace')} - ${safeFilename(file.title || 'Untitled')}.fm`,
        content: serializeProjectFile(project, file),
        iCloudSync: true,
        iCloudFolder: state.settings.syncFolderPath || '',
        notify: false
      });
    });
  });
}

function serializeProjectFile(project, file) {
  const doc = {
    format: 'frank.fm',
    version: 1,
    title: file.title || 'Untitled',
    html: file.html || '<p><br></p>',
    workspace: project.name || 'Workspace',
    settings: { ...state.settings },
    savedAt: new Date().toISOString()
  };
  return JSON.stringify(doc, null, 2);
}

function safeFilename(value) {
  return String(value || 'untitled').trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').slice(0, 80) || 'untitled';
}

function versionHistoryKey() {
  const file = activeProjectFile();
  return `frank:versions:${file ? file.id : activeTabId}`;
}

function saveVersionSnapshot(reason = 'snapshot') {
  try {
    const key = versionHistoryKey();
    const snapshots = JSON.parse(localStorage.getItem(key) || '[]');
    snapshots.unshift({
      id: Date.now(),
      reason,
      title: documentTitle.value || 'Untitled',
      html: cleanEditorCloneForStorage().innerHTML,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(snapshots.slice(0, 20)));
  } catch (_) {}
}

function openVersionHistory() {
  let snapshots = [];
  try { snapshots = JSON.parse(localStorage.getItem(versionHistoryKey()) || '[]'); } catch (_) {}
  const overlay = document.createElement('div');
  overlay.className = 'frank-overlay';
  overlay.innerHTML = `
    <div class="frank-panel version-panel" role="dialog" aria-modal="true" aria-label="Version history">
      <div class="frank-panel-header"><h2>Version history</h2><button type="button" data-close>×</button></div>
      <div class="version-list">
        ${snapshots.length ? snapshots.map(item => `
          <button type="button" class="version-item" data-version-id="${item.id}">
            <span>${escapeHTML(item.title || 'Untitled')}</span>
            <small>${escapeHTML(new Date(item.savedAt).toLocaleString())} · ${escapeHTML(item.reason || 'snapshot')}</small>
          </button>`).join('') : '<p class="version-empty">No snapshots yet. Saves and autosaves keep the latest 20.</p>'}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.closest('[data-close]')) overlay.remove();
    const item = e.target.closest('[data-version-id]');
    if (!item) return;
    const snap = snapshots.find(s => String(s.id) === item.dataset.versionId);
    if (!snap || !confirm('Restore this snapshot?')) return;
    saveVersionSnapshot('before restore');
    documentTitle.value = snap.title || 'Untitled';
    editor.innerHTML = snap.html || '<p><br></p>';
    bindAllCodeBlocks();
    bindAllTables();
    bindAllImages();
    bindEmbedBlocks();
    renderLiveEmbeds();
    markDirty();
    syncActiveProjectFile();
    updateStats();
    overlay.remove();
  });
}

function setupAutosave() {
  if (state.autosaveTimer) { clearInterval(state.autosaveTimer); state.autosaveTimer = null; }
  if (state.settings.autosaveEnabled) state.autosaveTimer = setInterval(autosaveDocument, 5 * 60 * 1000);
}

// ─────────────────────────────────────────────
// SETTINGS (autosave only — font/size in toolbar)
// ─────────────────────────────────────────────
function setupSettings() {
  syncSettingsControls();
  settingsClose.addEventListener('click', closeSettings);
  settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });
  settingsAutosave.addEventListener('change', () => {
    state.settings.autosaveEnabled = settingsAutosave.checked;
    persistSettings();
    setupAutosave();
  });
  settingsTypewriter && settingsTypewriter.addEventListener('change', () => {
    state.settings.typewriterMode = settingsTypewriter.checked;
    persistSettings();
    applySettings();
    if (state.settings.typewriterMode) scheduleTypewriterCenter();
  });
  settingsFolderSync && settingsFolderSync.addEventListener('change', () => {
    state.settings.folderSyncEnabled = settingsFolderSync.checked;
    state.settings.folderSyncPreferenceSet = true;
    persistSettings();
    setSaveStatus(settingsFolderSync.checked ? 'Folder sync on' : 'Folder sync off');
    syncSettingsControls();
  });
  settingsFolderChoose && settingsFolderChoose.addEventListener('click', () => {
    nativePost({ action: 'chooseICloudFolder' });
  });
  bindAppearanceSettings();
}

function openSettings() {
  syncSettingsControls();
  settingsModal.classList.add('active');
}

function closeSettings() {
  settingsModal.classList.remove('active');
  editor.focus();
}

function syncSettingsControls() {
  if (settingsAutosave) settingsAutosave.checked = Boolean(state.settings.autosaveEnabled);
  if (settingsTypewriter) settingsTypewriter.checked = Boolean(state.settings.typewriterMode);
  if (settingsFolderSync) settingsFolderSync.checked = Boolean(state.settings.folderSyncEnabled);
  if (settingsFolderPath) settingsFolderPath.textContent = state.settings.syncFolderPath || '~/Documents/frank';
  const settingsFont = document.getElementById('settings-font');
  const settingsFontSize = document.getElementById('settings-font-size');
  const settingsFontSizeValue = document.getElementById('settings-font-size-value');
  const settingsAccent = document.getElementById('settings-accent');
  const settingsAccentValue = document.getElementById('settings-accent-value');
  const settingsPaperLight = document.getElementById('settings-paper-light');
  const settingsPaperLightValue = document.getElementById('settings-paper-light-value');
  const settingsPaperDark = document.getElementById('settings-paper-dark');
  const settingsPaperDarkValue = document.getElementById('settings-paper-dark-value');
  const settingsCanvasWidth = document.getElementById('settings-canvas-width');
  const settingsCanvasWidthValue = document.getElementById('settings-canvas-width-value');
  const settingsCanvasHeight = document.getElementById('settings-canvas-height');
  const settingsCanvasHeightValue = document.getElementById('settings-canvas-height-value');
  if (settingsFont) settingsFont.value = state.settings.editorFont;
  if (settingsFontSize) settingsFontSize.value = String(state.settings.fontSize);
  if (settingsFontSizeValue) settingsFontSizeValue.textContent = `${state.settings.fontSize}px`;
  if (settingsAccent) settingsAccent.value = state.settings.accentColor || '#53794a';
  if (settingsAccentValue) settingsAccentValue.textContent = state.settings.accentColor || '#53794a';
  if (settingsPaperLight) settingsPaperLight.value = state.settings.lightCanvasColor || state.settings.paperColor || '#fffef8';
  if (settingsPaperLightValue) settingsPaperLightValue.textContent = state.settings.lightCanvasColor || state.settings.paperColor || '#fffef8';
  if (settingsPaperDark) settingsPaperDark.value = state.settings.darkCanvasColor || '#141922';
  if (settingsPaperDarkValue) settingsPaperDarkValue.textContent = state.settings.darkCanvasColor || '#141922';
  if (settingsCanvasWidth) settingsCanvasWidth.value = String(state.settings.canvasWidth || 820);
  if (settingsCanvasWidthValue) settingsCanvasWidthValue.textContent = `${state.settings.canvasWidth || 820}px`;
  if (settingsCanvasHeight) settingsCanvasHeight.value = String(state.settings.canvasHeight || 1200);
  if (settingsCanvasHeightValue) settingsCanvasHeightValue.textContent = `${state.settings.canvasHeight || 1200}px`;
  document.querySelectorAll('[data-theme-choice]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeChoice === (state.settings.theme || 'light'));
  });
}

function bindAppearanceSettings() {
  const themeGrid = document.getElementById('settings-theme-grid');
  const settingsFont = document.getElementById('settings-font');
  const settingsFontSize = document.getElementById('settings-font-size');
  const settingsAccent = document.getElementById('settings-accent');
  const settingsPaperLight = document.getElementById('settings-paper-light');
  const settingsPaperDark = document.getElementById('settings-paper-dark');
  const settingsCanvasWidth = document.getElementById('settings-canvas-width');
  const settingsCanvasHeight = document.getElementById('settings-canvas-height');

  themeGrid && themeGrid.addEventListener('click', e => {
    const btn = e.target.closest('[data-theme-choice]');
    if (!btn) return;
    state.settings.followSystemTheme = false;
    state.settings.theme = btn.dataset.themeChoice === 'midnight' ? 'dark' : btn.dataset.themeChoice;
    state.activeTheme = state.settings.theme;
    persistSettings();
    applySettings();
  });
  settingsFont && settingsFont.addEventListener('change', () => {
    state.settings.editorFont = settingsFont.value;
    persistSettings();
    applySettings();
  });
  settingsFontSize && settingsFontSize.addEventListener('input', () => {
    state.settings.fontSize = Number(settingsFontSize.value) || 18;
    persistSettings();
    applySettings();
  });
  settingsAccent && settingsAccent.addEventListener('input', () => {
    state.settings.accentColor = settingsAccent.value;
    persistSettings();
    applySettings();
  });
  settingsPaperLight && settingsPaperLight.addEventListener('input', () => {
    state.settings.lightCanvasColor = settingsPaperLight.value;
    state.settings.paperColor = state.settings.lightCanvasColor;
    persistSettings();
    applySettings();
  });
  settingsPaperDark && settingsPaperDark.addEventListener('input', () => {
    state.settings.darkCanvasColor = settingsPaperDark.value;
    persistSettings();
    applySettings();
  });
  settingsCanvasWidth && settingsCanvasWidth.addEventListener('input', () => {
    state.settings.canvasWidth = Math.max(560, Math.min(1400, Number(settingsCanvasWidth.value) || 820));
    persistSettings();
    applySettings();
    updatePageGuides();
  });
  settingsCanvasHeight && settingsCanvasHeight.addEventListener('input', () => {
    state.settings.canvasHeight = Math.max(700, Math.min(2600, Number(settingsCanvasHeight.value) || 1200));
    persistSettings();
    applySettings();
    updatePageGuides();
  });
}

function loadSettings() {
  let savedSettings = {};
  try { savedSettings = JSON.parse(localStorage.getItem('frank:settings') || '{}'); } catch(e) {}
  state.settings = { ...state.settings, ...savedSettings };
  if (!savedSettings.folderSyncPreferenceSet) {
    state.settings.folderSyncEnabled = true;
  }
  if (typeof state.settings.followSystemTheme !== 'boolean') state.settings.followSystemTheme = true;
  if (state.settings.theme === 'midnight') state.settings.theme = 'dark';
  state.settings.lightCanvasColor = state.settings.lightCanvasColor || state.settings.paperColor || '#fffef8';
  state.settings.darkCanvasColor = state.settings.darkCanvasColor || '#141922';
  state.settings.canvasWidth = Math.max(560, Math.min(1400, Number(state.settings.canvasWidth) || 820));
  state.settings.canvasHeight = Math.max(700, Math.min(2600, Number(state.settings.canvasHeight) || 1200));
  state.settings.folderSyncEnabled = state.settings.folderSyncEnabled !== false;
  state.settings.folderSyncPreferenceSet = Boolean(state.settings.folderSyncPreferenceSet);
  state.settings.syncFolderPath = state.settings.syncFolderPath || '';
  state.settings.typewriterMode = Boolean(state.settings.typewriterMode);
  state.settings.paperColor = state.settings.lightCanvasColor;
  state.activeTheme = systemTheme();
}

function persistSettings() {
  localStorage.setItem('frank:settings', JSON.stringify(state.settings));
}

function applySettings() {
  // Write the real font stack directly — nested var() references set from JS
  // are not reliably resolved by WebKit, so we avoid them entirely.
  const stack = FONT_STACKS[state.settings.editorFont] || FONT_STACKS.serif;
  if (state.settings.theme === 'midnight') state.settings.theme = 'dark';
  const theme = systemTheme();
  const accent = state.settings.accentColor || '#53794a';
  const isDark = theme === 'dark';
  const paper = isDark
    ? (state.settings.darkCanvasColor || '#141922')
    : (state.settings.lightCanvasColor || state.settings.paperColor || '#fffef8');
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.setProperty('--active-editor-font', stack);
  document.documentElement.style.setProperty('--active-editor-size', `${state.settings.fontSize}px`);
  applyCanvasSizeSettings();
  document.documentElement.style.setProperty('--accent-color', accent);
  document.documentElement.style.setProperty('--accent-hover', `color-mix(in srgb, ${accent} 82%, ${isDark ? '#ffffff' : '#000000'})`);
  document.documentElement.style.setProperty('--accent-light', `color-mix(in srgb, ${accent} ${isDark ? '22%' : '14%'}, transparent)`);
  document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, color-mix(in srgb, ${accent} 64%, #ffffff) 0%, ${accent} 100%)`);
  document.documentElement.style.setProperty('--bg-paper', paper);
  document.documentElement.style.setProperty('--cream-paper', paper);
  document.documentElement.style.setProperty('--card-bg', paper);
  document.documentElement.style.setProperty('--bg-app', isDark ? '#090d13' : `color-mix(in srgb, #f4f6f2 92%, ${accent})`);
  document.documentElement.style.setProperty('--bg-sidebar', isDark ? '#111722' : '#ffffff');
  document.documentElement.style.setProperty('--bg-toolbar', isDark ? 'rgba(18, 23, 31, 0.88)' : 'rgba(255, 255, 255, 0.88)');
  document.documentElement.style.setProperty('--shell-bg', isDark ? '#090d13' : `color-mix(in srgb, #eef1f2 94%, ${accent})`);
  document.documentElement.style.setProperty('--shell-panel', isDark ? 'rgba(18, 23, 31, 0.86)' : 'rgba(255, 255, 255, 0.78)');
  document.documentElement.style.setProperty('--shell-line', `color-mix(in srgb, ${accent} ${isDark ? '34%' : '18%'}, transparent)`);
  document.documentElement.style.setProperty('--glass-panel', isDark ? 'rgba(18, 24, 34, 0.56)' : `color-mix(in srgb, #ffffff 58%, ${accent} 8%)`);
  document.documentElement.style.setProperty('--glass-panel-strong', isDark ? 'rgba(24, 31, 44, 0.72)' : `color-mix(in srgb, #ffffff 74%, ${accent} 10%)`);
  document.documentElement.style.setProperty('--glass-panel-soft', isDark ? 'rgba(255, 255, 255, 0.08)' : `color-mix(in srgb, #ffffff 38%, ${accent} 7%)`);
  document.documentElement.style.setProperty('--glass-line', `color-mix(in srgb, ${accent} ${isDark ? '28%' : '22%'}, transparent)`);
  document.documentElement.style.setProperty('--border-color', `color-mix(in srgb, ${accent} ${isDark ? '28%' : '18%'}, transparent)`);
  document.documentElement.style.setProperty('--border-active', accent);
  document.documentElement.style.setProperty('--table-border', `color-mix(in srgb, ${accent} ${isDark ? '42%' : '36%'}, ${paper})`);
  document.documentElement.style.setProperty('--table-border-strong', `color-mix(in srgb, ${accent} ${isDark ? '58%' : '52%'}, ${paper})`);
  document.documentElement.style.setProperty('--table-header-bg', `color-mix(in srgb, ${paper} ${isDark ? '28%' : '82%'}, ${accent})`);
  document.documentElement.style.setProperty('--table-row-hover', `color-mix(in srgb, ${accent} ${isDark ? '14%' : '9%'}, transparent)`);
  document.body.classList.toggle('typewriter-mode', Boolean(state.settings.typewriterMode));

  // Sync toolbar controls to current state
  const sd = document.getElementById('toolbar-font-size-display');
  if (sd) sd.textContent = `${state.settings.fontSize}px`;
  const tf = document.getElementById('toolbar-font');
  if (tf) tf.value = state.settings.editorFont;
  if (ctxFont) ctxFont.value = state.settings.editorFont;
  syncSettingsControls();
  updateThemeToggleIcon();
}

function applyCanvasSizeSettings() {
  const width = Math.max(560, Math.min(1400, Number(state.settings.canvasWidth) || 820));
  const height = Math.max(700, Math.min(2600, Number(state.settings.canvasHeight) || 1200));
  state.settings.canvasWidth = width;
  state.settings.canvasHeight = height;
  document.documentElement.style.setProperty('--page-width', `${width}px`);
  document.documentElement.style.setProperty('--page-min-height', `${height}px`);
  if (editor) {
    editor.style.width = `${width}px`;
    editor.style.maxWidth = 'none';
    editor.style.minHeight = `${height}px`;
  }
}

// ─────────────────────────────────────────────
// DIRTY / TITLE STATE
// ─────────────────────────────────────────────
function markDirty() {
  if (!state.isDirty) {
    state.isDirty = true;
    const tab = activeProjectFile() || tabs.find(t => t.id === activeTabId);
    if (tab && !tab.isDirty) { tab.isDirty = true; renderTabs(); }
  }
  updateWindowTitle();
}

function updateWindowTitle() {
  document.title = `${documentTitle.value || 'Untitled Draft'}${state.isDirty ? ' *' : ''} - frank 2`;
  if (saveStatePill && state.isDirty) saveStatePill.textContent = 'Unsaved';
}

function setSaveStatus(label) {
  if (statReading) statReading.textContent = `${label} — ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;
  if (saveStatePill) saveStatePill.textContent = label;
}

function safeDocumentTitle() {
  return (documentTitle.value.trim() || 'untitled_draft').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'untitled_draft';
}

// ─────────────────────────────────────────────
// DOCUMENT SERIALIZATION
// ─────────────────────────────────────────────
function buildFrankDocument() {
  // Clone so search highlights don't end up in saved content
  const clone = cleanEditorCloneForStorage();
  clone.normalize();
  return { format:'frank.fm', version:1, title: documentTitle.value.trim()||'Untitled Draft', html: clone.innerHTML, settings:{...state.settings}, savedAt: new Date().toISOString() };
}

function serializeFrankDocument() { return JSON.stringify(buildFrankDocument(), null, 2); }

const FRANK_ALLOWED_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DIV', 'EM', 'FIGCAPTION', 'FIGURE',
  'H1', 'H2', 'H3', 'H4', 'HR', 'I', 'IFRAME', 'IMG', 'LI', 'MARK', 'OL', 'P', 'PRE',
  'S', 'SPAN', 'STRIKE', 'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY', 'TD',
  'TH', 'THEAD', 'TR', 'U', 'UL'
]);

const FRANK_REMOVE_WITH_CONTENT = new Set([
  'SCRIPT', 'STYLE', 'OBJECT', 'EMBED', 'LINK', 'META', 'FORM',
  'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'OPTION', 'SVG', 'MATH', 'CANVAS',
  'VIDEO', 'AUDIO', 'SOURCE'
]);

function frankSafeURL(value, kind) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (kind === 'image') {
    if (lower.startsWith('data:image/') || lower.startsWith('blob:')) return raw;
    return '';
  }
  if (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('#')
  ) return raw;
  return '';
}

function frankSafeStyle(value) {
  return String(value || '')
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .filter(part => !/url\s*\(|expression\s*\(|javascript:/i.test(part))
    .join('; ');
}

function sanitizeFrankHTML(rawHTML) {
  const template = document.createElement('template');
  template.innerHTML = String(rawHTML || '');
  const nodes = [];
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const tag = node.tagName;
    if (FRANK_REMOVE_WITH_CONTENT.has(tag)) {
      node.remove();
      continue;
    }
    if (!FRANK_ALLOWED_TAGS.has(tag)) {
      node.replaceWith(...Array.from(node.childNodes));
      continue;
    }

    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith('on')) {
        node.removeAttribute(attr.name);
      } else if (name === 'href' && tag === 'A') {
        const safe = frankSafeURL(value, 'link');
        if (safe) {
          node.setAttribute('href', safe);
          node.setAttribute('rel', 'noopener noreferrer');
        } else {
          node.removeAttribute(attr.name);
        }
      } else if (name === 'src' && tag === 'IMG') {
        const safe = frankSafeURL(value, 'image');
        if (safe) node.setAttribute('src', safe);
        else node.remove();
      } else if (name === 'style') {
        const safe = frankSafeStyle(value);
        if (safe) node.setAttribute('style', safe);
        else node.removeAttribute(attr.name);
      } else if (![
        'allow', 'allowfullscreen', 'alt', 'aria-label', 'class', 'colspan', 'contenteditable',
        'data-embed-code', 'data-lang', 'data-page-link', 'data-tag', 'height', 'loading',
        'referrerpolicy', 'rowspan', 'sandbox', 'spellcheck', 'srcdoc', 'title', 'width'
      ].includes(name)) {
        node.removeAttribute(attr.name);
      }
    }
  }

  return template.innerHTML || '<p><br></p>';
}

function loadFrankDocument(rawContent, filePath = null) {
  try {
    const doc = JSON.parse(rawContent);
    if (!doc || doc.format !== 'frank.fm') throw new Error('Unsupported frank document format.');
    documentTitle.value = doc.title || 'Untitled Draft';
    editor.innerHTML   = sanitizeFrankHTML(doc.html || '<p><br></p>');
    if (doc.settings) { state.settings = { ...state.settings, ...doc.settings }; persistSettings(); applySettings(); setupAutosave(); }
    state.filePath = filePath;
    state.isDirty  = false;
    bindEmbeddedCopyButtons();
    highlightAllCodeBlocks();
    bindAllCodeBlocks();
    bindAllTables();
    bindAllImages();
    bindEmbedBlocks();
    renderLiveEmbeds();
    updateStats();
    updateWindowTitle();
    setSaveStatus('Opened');
    const tab = activeProjectFile() || tabs.find(t => t.id === activeTabId);
    if (tab) {
      tab.title = documentTitle.value;
      tab.html = editor.innerHTML;
      tab.isDirty = false;
      tab.filePath = filePath;
      if (activeProjectFile()) {
        activeTabId = tab.id;
        persistProjects();
        renderProjectPanel();
      }
      renderTabs();
    }
  } catch(e) { alert(e.message || 'Could not open this .fm file.'); }
}

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
function exportToMarkdown() {
  let md = "";
  Array.from(editor.childNodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) { if (node.textContent.trim()) md += node.textContent + "\n\n"; return; }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'h1') md += `# ${node.textContent.trim()}\n\n`;
    else if (tag === 'h2') md += `## ${node.textContent.trim()}\n\n`;
    else if (tag === 'h3') md += `### ${node.textContent.trim()}\n\n`;
    else if (tag === 'p') { const h = node.innerHTML; if (h !== '<br>' && h.trim()) md += `${parseInlineStyles(node)}\n\n`; }
    else if (tag === 'blockquote') md += `> ${node.textContent.trim()}\n\n`;
    else if (tag === 'ul') { node.querySelectorAll('li').forEach(li => { md += `- ${parseInlineStyles(li)}\n`; }); md += "\n"; }
    else if (tag === 'ol') { node.querySelectorAll('li').forEach((li,i) => { md += `${i+1}. ${parseInlineStyles(li)}\n`; }); md += "\n"; }
    else if (node.classList.contains('code-block-wrapper')) {
      const lang = (node.querySelector('.code-lang-tag')||{}).textContent || 'code';
      const code = (node.querySelector('code')||{}).textContent || '';
      md += `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    }
  });
  triggerFileDownload(md.trim(), 'text/markdown;charset=utf-8', '.md');
}

function parseInlineStyles(el) {
  let t = el.innerHTML;
  t = t.replace(/<strong>(.*?)<\/strong>/gi,'**$1**').replace(/<b>(.*?)<\/b>/gi,'**$1**')
       .replace(/<em>(.*?)<\/em>/gi,'*$1*').replace(/<i>(.*?)<\/i>/gi,'*$1*')
       .replace(/<u>(.*?)<\/u>/gi,'<u>$1</u>').replace(/<strike>(.*?)<\/strike>/gi,'~~$1~~')
       .replace(/<code>(.*?)<\/code>/gi,'`$1`').replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,'[$2]($1)');
  const span = document.createElement('span');
  span.innerHTML = t;
  return span.textContent;
}

function exportToWord() {
  const title = documentTitle.value || "document";
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:Georgia,serif;line-height:1.6;color:#333;margin:1.5in 1.2in}
h1,h2,h3{font-family:Arial,sans-serif;color:#111;margin-top:24pt;margin-bottom:12pt}
h1{font-size:24pt;border-bottom:1px solid #ccc;padding-bottom:6pt}
h2{font-size:18pt}h3{font-size:14pt}
p{margin-bottom:12pt;font-size:11pt}
blockquote{border-left:3pt solid #5a7f50;padding-left:12pt;margin:12pt 0;color:#555;font-style:italic}
ul,ol{margin-bottom:12pt;padding-left:20pt}li{margin-bottom:4pt}
.code-block-wrapper{background:#1e1e2e;border:1px solid #ddd;padding:12pt;margin:18pt 0;border-radius:6px}
.code-header{display:none}pre{background:#1e1e2e;padding:8pt;margin:0}
code{font-family:'Courier New',monospace;font-size:10pt;color:#f8fafc;background:#1e1e2e}
</style></head><body>${editor.innerHTML}</body></html>`;
  triggerFileDownload(html, 'application/msword;charset=utf-8', '.doc');
}

function buildExportHTML() {
  // Deep-clone the editor so we can strip non-content nodes safely
  const clone = editor.cloneNode(true);
  clone.querySelectorAll('.line-nums, [data-live-render]').forEach(el => el.remove());
  clone.querySelectorAll('.page-break-ruler').forEach(el => el.remove());
  clone.querySelectorAll('.code-actions').forEach(el => el.remove());
  // Strip binding-guard data attributes so the HTML is clean
  clone.querySelectorAll('[data-kb-bound],[data-hl-bound],[data-nav-bound],[data-res-bound],[data-cap-bound]').forEach(el => {
    ['kbBound','hlBound','navBound','resBound','capBound'].forEach(k => delete el.dataset[k]);
  });
  // Unwrap search highlights
  clone.querySelectorAll('mark.frank-hit').forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
  // Normalise images: convert caption input → <figcaption>, remove handle
  clone.querySelectorAll('.frank-figure').forEach(fig => {
    const capInput = fig.querySelector('.frank-img-caption');
    if (capInput) {
      const val = capInput.textContent.trim();
      capInput.remove();
      if (val) {
        const fc = document.createElement('figcaption');
        fc.textContent = val;
        fig.appendChild(fc);
      }
    }
    const handle = fig.querySelector('.frank-img-resize-handle');
    if (handle) handle.remove();
    // Unwrap .frank-img-container while keeping <img>
    const container = fig.querySelector('.frank-img-container');
    if (container) {
      const img = container.querySelector('img');
      if (img) {
        const maxW = container.style.width || '100%';
        img.style.maxWidth = maxW;
        img.style.width    = '100%';
        img.style.height   = 'auto';
        container.replaceWith(img);
      } else {
        container.remove();
      }
    }
    fig.contentEditable = '';
  });

  const bodyHTML = clone.innerHTML;
  const title    = escapeHTML(documentTitle.value || 'Untitled Document');
  const fs       = state.settings.fontSize || 18;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: ${fs}px;
    line-height: 1.75;
    color: #1a202c;
    background: #ffffff;
    padding: 54px 68px;
    max-width: 100%;
  }
  h1, h2, h3, h4 {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-weight: 600;
    color: #111827;
    margin-top: 1.8em;
    margin-bottom: 0.5em;
    line-height: 1.3;
  }
  h1 { font-size: 1.95em; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 0.35em; margin-top: 0; }
  h2 { font-size: 1.45em; }
  h3 { font-size: 1.18em; }
  p  { margin-bottom: 0.9em; }
  ul, ol { margin-bottom: 0.9em; padding-left: 1.6em; }
  li { margin-bottom: 0.25em; }
  blockquote {
    border-left: 4px solid #5a7f50;
    padding: 0.45em 1em;
    margin: 1.2em 0;
    color: #4a5568;
    font-style: italic;
    background: #f7faf7;
    border-radius: 0 5px 5px 0;
  }
  a { color: #2563eb; text-decoration: underline; }
  strong { font-weight: 700; }
  em     { font-style: italic; }

  /* ── Code blocks ─────────────────────────────── */
  .code-block-wrapper {
    background: #1e1e2e;
    border-radius: 8px;
    margin: 1.4em 0;
    overflow: hidden;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .code-header {
    background: #13131f;
    padding: 0.45em 1em;
    display: flex;
    align-items: center;
  }
  .code-lang-tag {
    font-family: ui-monospace, Menlo, 'Courier New', monospace;
    font-size: 10.5px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  pre {
    display: block !important;
    background: transparent !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }
  .line-nums { display: none !important; }
  code {
    display: block !important;
    font-family: ui-monospace, Menlo, 'Courier New', monospace !important;
    font-size: 12.5px !important;
    line-height: 1.65 !important;
    color: #f1f5f9 !important;
    padding: 0.9em 1.1em !important;
    white-space: pre-wrap !important;
    word-break: break-all !important;
    background: transparent !important;
  }
  /* Syntax token colours matching prism-lite */
  .token.keyword  { color: #c792ea !important; }
  .token.string   { color: #a3e6ac !important; }
  .token.comment  { color: #6272a4 !important; font-style: italic; }
  .token.number   { color: #f78c6c !important; }
  .token.boolean  { color: #ff9cac !important; }
  .token.function { color: #82aaff !important; }

  /* ── Tables ── */
  table { width: 100%; border-collapse: collapse; margin: 1.2em 0; font-size: 0.9em; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
  th, td { border: 1px solid #e2e8f0; padding: 0.45em 0.75em; vertical-align: top; }
  thead th { background: #f8fafc; font-weight: 600; font-size: 0.78em; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }

  /* ── Images ── */
  figure.frank-figure { display: block; margin: 1.5em auto; text-align: center; page-break-inside: avoid; break-inside: avoid; }
  figure.frank-figure img { display: inline-block; max-width: 100%; height: auto; border-radius: 5px; border: 1px solid #e2e8f0; }
  figure.frank-figure figcaption { display: inline-block; margin-top: 0.4em; background: #fff; color: #3b82f6; border: 1.5px dashed #3b82f6; border-radius: 20px; padding: 0.18em 0.8em; font-size: 0.75em; }

  /* Hide editor-only chrome */
  .page-break-ruler, #page-guides-overlay { display: none !important; }
</style>
</head>
<body>
<h1>${title}</h1>
${bodyHTML}
</body>
</html>`;
}

function exportToPDF() {
  const orig = exportDropdownBtn.innerHTML;
  const exportSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`;

  exportDropdownBtn.innerHTML = `${exportSVG} Generating PDF…`;
  exportMenu.classList.remove('active');

  // Post to native PDFExportBridge (registered as 'pdfExportHandler' in Swift)
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.pdfExportHandler) {
    window.webkit.messageHandlers.pdfExportHandler.postMessage({
      html:     buildExportHTML(),
      filename: `${safeDocumentTitle()}.pdf`
    });
    // The Swift side drives the rest; reset button after a moment
    setTimeout(() => { exportDropdownBtn.innerHTML = orig; }, 2500);
  } else {
    // Fallback for non-native context: download as self-contained HTML
    exportDropdownBtn.innerHTML = orig;
    triggerFileDownload(buildExportHTML(), 'text/html;charset=utf-8', '.html');
  }
}

// ─────────────────────────────────────────────
// NATIVE BRIDGE / DOWNLOAD
// ─────────────────────────────────────────────
function nativePost(payload) {
  const b = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.appBridge;
  if (!b) return false;
  b.postMessage(payload);
  return true;
}

function triggerFileDownload(content, mime, ext) {
  const name = `${safeDocumentTitle()}${ext}`;
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.downloadHandler) {
    window.webkit.messageHandlers.downloadHandler.postMessage({ filename:name, content, mime, isDataURI:false });
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// ─────────────────────────────────────────────
// TABLES
// ─────────────────────────────────────────────

// ── Helpers ──────────────────────────────────
function _tableColCount(table) {
  const firstRow = table.querySelector('tr');
  return firstRow ? firstRow.cells.length : 0;
}
function _tableRowCount(table) {
  return table.querySelectorAll('tr').length;
}

function insertTable(rows = 3, cols = 3) {
  const table = document.createElement('table');
  table.className = 'frank-table';

  const thead = document.createElement('thead');
  const hrow  = document.createElement('tr');
  for (let c = 0; c < cols; c++) {
    const th = document.createElement('th');
    th.contentEditable = 'true';
    th.innerHTML = '<br>';
    hrow.appendChild(th);
  }
  thead.appendChild(hrow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (let r = 0; r < rows - 1; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const td = document.createElement('td');
      td.contentEditable = 'true';
      td.innerHTML = '<br>';
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  const sel = window.getSelection();
  let inserted = false;
  if (sel && sel.rangeCount > 0) {
    let node = sel.getRangeAt(0).startContainer;
    while (node && node.parentNode !== editor) node = node.parentNode;
    if (node && node.parentNode === editor) { node.after(table); inserted = true; }
  }
  if (!inserted) editor.appendChild(table);

  const p = document.createElement('p');
  p.innerHTML = '<br>';
  table.after(p);

  setupTableNavigation(table);
  const firstCell = table.querySelector('th');
  if (firstCell) { firstCell.focus(); placeCaretAtEnd(firstCell); }

  markDirty();
  updateStats();
  updatePageGuides();
}

function addTableRow(table) {
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  const cols = _tableColCount(table);
  const tr = document.createElement('tr');
  for (let c = 0; c < cols; c++) {
    const td = document.createElement('td');
    td.contentEditable = 'true';
    td.innerHTML = '<br>';
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
  const first = tr.querySelector('td');
  if (first) { first.focus(); placeCaretAtEnd(first); }
  markDirty();
}

function removeLastTableRow(table) {
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  if (rows.length === 0) return;
  rows[rows.length - 1].remove();
  markDirty();
}

function addTableColumn(table) {
  table.querySelectorAll('tr').forEach((tr, i) => {
    const cell = i === 0 ? document.createElement('th') : document.createElement('td');
    cell.contentEditable = 'true';
    cell.innerHTML = '<br>';
    tr.appendChild(cell);
  });
  markDirty();
}

function removeLastTableColumn(table) {
  if (_tableColCount(table) <= 1) return;
  table.querySelectorAll('tr').forEach(tr => {
    if (tr.lastElementChild) tr.lastElementChild.remove();
  });
  markDirty();
}

function setTableRows(table, target) {
  let cur = _tableRowCount(table);
  while (cur < target) { addTableRow(table);        cur++; }
  while (cur > target && cur > 1) { removeLastTableRow(table);    cur--; }
}
function setTableCols(table, target) {
  let cur = _tableColCount(table);
  while (cur < target) { addTableColumn(table);     cur++; }
  while (cur > target && cur > 1) { removeLastTableColumn(table); cur--; }
}

function setupTableNavigation(table) {
  if (table.dataset.navBound) return;
  table.dataset.navBound = '1';
  table.addEventListener('focusin', (e) => {
    const cell = e.target.closest('td, th');
    if (!cell || !table.contains(cell)) return;
    table.querySelectorAll('.selected-cell').forEach(el => el.classList.remove('selected-cell'));
    cell.classList.add('selected-cell');
  });
  table.addEventListener('focusout', (e) => {
    const next = e.relatedTarget;
    if (!next || !table.contains(next)) {
      table.querySelectorAll('.selected-cell').forEach(el => el.classList.remove('selected-cell'));
    }
  });
  table.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const cell = e.target.closest('td, th');
    if (!cell || !table.contains(cell)) return;
    e.preventDefault();
    const allCells = Array.from(table.querySelectorAll('th, td'));
    const idx = allCells.indexOf(cell);
    if (e.shiftKey) {
      if (idx > 0) { allCells[idx - 1].focus(); placeCaretAtEnd(allCells[idx - 1]); }
    } else {
      if (idx < allCells.length - 1) { allCells[idx + 1].focus(); placeCaretAtEnd(allCells[idx + 1]); }
      else addTableRow(table);
    }
    markDirty();
  });
}

function bindAllTables() {
  editor.querySelectorAll('.frank-table').forEach(t => setupTableNavigation(t));
}

// ── Grid picker + hover overlay ───────────────
function setupTableControls() {
  const tbBtn = document.getElementById('toolbar-insert-table');

  // ─ Picker ─────────────────────────────────────────────────────────────
  const PICK_ROWS = 6, PICK_COLS = 8;
  const picker = document.createElement('div');
  picker.className = 'frank-tbl-picker';
  picker.innerHTML =
    `<div class="frank-tbl-picker-grid" id="ftpg"></div>` +
    `<div class="frank-tbl-picker-dims" id="ftpd">3 × 3</div>`;
  document.body.appendChild(picker);

  const grid   = picker.querySelector('#ftpg');
  const dimsEl = picker.querySelector('#ftpd');

  grid.style.gridTemplateColumns = `repeat(${PICK_COLS}, 1fr)`;
  for (let r = 1; r <= PICK_ROWS; r++) {
    for (let c = 1; c <= PICK_COLS; c++) {
      const cell = document.createElement('button');
      cell.className = 'frank-tbl-picker-cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      grid.appendChild(cell);
    }
  }

  let pickR = 3, pickC = 3;
  function hilite(r, c) {
    pickR = r; pickC = c;
    grid.querySelectorAll('.frank-tbl-picker-cell').forEach(el => {
      el.classList.toggle('active', +el.dataset.r <= r && +el.dataset.c <= c);
    });
    dimsEl.textContent = `${r} × ${c}`;
  }
  hilite(3, 3);

  grid.addEventListener('mouseover', e => {
    const el = e.target.closest('.frank-tbl-picker-cell');
    if (el) hilite(+el.dataset.r, +el.dataset.c);
  });
  function openPicker() {
    saveSelection();
    if (!tbBtn) return;
    const r = tbBtn.getBoundingClientRect();
    picker.style.left = `${r.left}px`;
    picker.style.top  = `${r.bottom + 6}px`;
    picker.classList.add('visible');
  }
  function closePicker() { picker.classList.remove('visible'); }

  tbBtn && tbBtn.addEventListener('mousedown', e => {
    e.preventDefault();
    picker.classList.contains('visible') ? closePicker() : openPicker();
  });
  document.addEventListener('mousedown', e => {
    // Use .contains() so clicks on the inner <svg>/<path> don't falsely close the picker
    if (!picker.contains(e.target) && !(tbBtn && tbBtn.contains(e.target))) closePicker();
  });

  // mousedown (not click) so focus never leaves the editor, selection stays intact
  grid.addEventListener('mousedown', e => {
    const el = e.target.closest('.frank-tbl-picker-cell');
    if (!el) return;
    e.preventDefault();          // keep focus in editor
    closePicker();
    restoreSelection();
    insertTable(+el.dataset.r, +el.dataset.c);
  });

}

// ─────────────────────────────────────────────
// FULL-TEXT SEARCH
// ─────────────────────────────────────────────
let _searchMatches   = [];
let _searchCurrentIdx = -1;

function setupSearch() {
  const bar   = document.getElementById('search-bar');
  const input = document.getElementById('search-input');
  const prev  = document.getElementById('search-prev');
  const next  = document.getElementById('search-next');
  const close = document.getElementById('search-close');
  const replaceOne = document.getElementById('replace-one');
  const replaceAll = document.getElementById('replace-all');
  const tbBtn = document.getElementById('toolbar-search');
  if (!bar || !input) return;

  tbBtn && tbBtn.addEventListener('mousedown', e => { e.preventDefault(); openSearch(); });

  input.addEventListener('input', () => searchDocument());

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigateSearch(e.shiftKey ? -1 : +1);
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  });

  prev  && prev.addEventListener('click',  () => navigateSearch(-1));
  next  && next.addEventListener('click',  () => navigateSearch(+1));
  replaceOne && replaceOne.addEventListener('click', replaceCurrentMatch);
  replaceAll && replaceAll.addEventListener('click', replaceAllMatches);
  close && close.addEventListener('click', () => closeSearch());
}

function openSearch() {
  const bar   = document.getElementById('search-bar');
  const input = document.getElementById('search-input');
  if (!bar) return;
  bar.classList.add('visible');
  setTimeout(() => { if (input) { input.focus(); input.select(); } }, 40);
}

function closeSearch() {
  const bar   = document.getElementById('search-bar');
  const input = document.getElementById('search-input');
  const replace = document.getElementById('replace-input');
  if (!bar) return;
  bar.classList.remove('visible');
  clearSearchHighlights();
  if (input) input.value = '';
  if (replace) replace.value = '';
  const count = document.getElementById('search-count');
  if (count) { count.textContent = ''; count.className = 'search-count'; }
  editor.focus();
}

function clearSearchHighlights() {
  // Unwrap every <mark class="frank-hit"> back to a plain text node
  editor.querySelectorAll('mark.frank-hit').forEach(mark => {
    const txt = document.createTextNode(mark.textContent);
    mark.replaceWith(txt);
    txt.parentNode && txt.parentNode.normalize();
  });
  _searchMatches    = [];
  _searchCurrentIdx = -1;
}

const _runSearch = debounce(() => {
  clearSearchHighlights();

  const input  = document.getElementById('search-input');
  const count  = document.getElementById('search-count');
  const query  = (input && input.value) || '';

  if (!query.trim()) {
    if (count) { count.textContent = ''; count.className = 'search-count'; }
    return;
  }

  const queryLow = query.toLowerCase();

  // Collect all text nodes in the editor (excluding gutters and captions)
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (p.closest('.line-nums, .frank-img-caption, .frank-img-resize-handle, .code-actions')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  textNodes.forEach(textNode => {
    const text    = textNode.textContent;
    const textLow = text.toLowerCase();
    const frags   = [];
    let last = 0, idx;

    while ((idx = textLow.indexOf(queryLow, last)) !== -1) {
      if (idx > last) frags.push(document.createTextNode(text.slice(last, idx)));
      const mark = document.createElement('mark');
      mark.className = 'frank-hit';
      mark.textContent = text.slice(idx, idx + query.length);
      frags.push(mark);
      _searchMatches.push(mark);
      last = idx + query.length;
    }
    if (!frags.length) return;
    if (last < text.length) frags.push(document.createTextNode(text.slice(last)));

    const parent = textNode.parentNode;
    const ref    = textNode.nextSibling;
    parent.removeChild(textNode);
    frags.forEach(f => parent.insertBefore(f, ref));
  });

  if (count) {
    if (_searchMatches.length === 0) {
      count.textContent = 'No results';
      count.className   = 'search-count no-results';
    } else {
      _searchCurrentIdx = 0;
      _highlightCurrentMatch();
      count.textContent = `1 / ${_searchMatches.length}`;
      count.className   = 'search-count';
    }
  }
}, 180);

function searchDocument() { _runSearch(); }

function navigateSearch(dir) {
  if (!_searchMatches.length) return;
  _searchCurrentIdx = (_searchCurrentIdx + dir + _searchMatches.length) % _searchMatches.length;
  _highlightCurrentMatch();
  const count = document.getElementById('search-count');
  if (count) count.textContent = `${_searchCurrentIdx + 1} / ${_searchMatches.length}`;
}

function _highlightCurrentMatch() {
  _searchMatches.forEach((m, i) => m.classList.toggle('frank-hit-current', i === _searchCurrentIdx));
  const cur = _searchMatches[_searchCurrentIdx];
  if (cur) cur.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function openGlobalSearch() {
  syncActiveProjectFile();
  const overlay = document.createElement('div');
  overlay.className = 'frank-overlay';
  overlay.innerHTML = `
    <div class="frank-panel global-search-panel" role="dialog" aria-modal="true" aria-label="Global search">
      <div class="frank-panel-header"><h2>Global search</h2><button type="button" data-close>×</button></div>
      <input class="global-search-input" placeholder="Search all workspaces..." autocomplete="off" spellcheck="false">
      <div class="global-search-results"></div>
    </div>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector('.global-search-input');
  const results = overlay.querySelector('.global-search-results');
  const render = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = '<p class="version-empty">Type to search pages.</p>';
      return;
    }
    const matches = [];
    state.projects.forEach(project => project.files.forEach(file => {
      const text = `${file.title || ''} ${htmlToPlainText(file.html || '')}`.toLowerCase();
      if (text.includes(q)) matches.push({ project, file, excerpt: searchExcerpt(htmlToPlainText(file.html || ''), q) });
    }));
    results.innerHTML = matches.length ? matches.map(({ project, file, excerpt }) => `
      <button type="button" class="global-search-result" data-project-id="${project.id}" data-file-id="${file.id}">
        <span>${escapeHTML(file.title || 'Untitled')}</span>
        <small>${escapeHTML(project.name || 'Workspace')}</small>
        <em>${escapeHTML(excerpt)}</em>
      </button>`).join('') : '<p class="version-empty">No matches.</p>';
  };
  input.addEventListener('input', render);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.closest('[data-close]')) overlay.remove();
    const result = e.target.closest('.global-search-result');
    if (!result) return;
    loadProjectFile(result.dataset.projectId, result.dataset.fileId);
    overlay.remove();
  });
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.remove(); });
  setTimeout(() => input.focus(), 20);
  render();
}

function htmlToPlainText(html) {
  const tmp = document.createElement('template');
  tmp.innerHTML = String(html || '');
  return (tmp.content.textContent || '').replace(/\s+/g, ' ').trim();
}

function searchExcerpt(text, q) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  const idx = clean.toLowerCase().indexOf(q);
  if (idx === -1) return clean.slice(0, 120);
  return clean.slice(Math.max(0, idx - 45), idx + q.length + 75);
}

function replacementText() {
  return (document.getElementById('replace-input')?.value || '');
}

function replaceCurrentMatch() {
  if (!_searchMatches.length || _searchCurrentIdx < 0) return;
  const mark = _searchMatches[_searchCurrentIdx];
  if (!mark || !mark.parentNode) return;
  mark.replaceWith(document.createTextNode(replacementText()));
  markDirty();
  syncActiveProjectFile();
  updateStats();
  searchDocument();
}

function replaceAllMatches() {
  if (!_searchMatches.length) return;
  const replacement = replacementText();
  _searchMatches.forEach(mark => {
    if (mark.parentNode) mark.replaceWith(document.createTextNode(replacement));
  });
  _searchMatches = [];
  _searchCurrentIdx = -1;
  markDirty();
  syncActiveProjectFile();
  updateStats();
  searchDocument();
}

// ─────────────────────────────────────────────
// IMAGE PASTE & RESIZE
// ─────────────────────────────────────────────
function setupImagePaste() {
  editor.addEventListener('paste', (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = ev => insertImage(ev.target.result);
        reader.readAsDataURL(file);
        return;
      }
    }
  });

  editor.addEventListener('dragover', (e) => {
    if (!hasImageFiles(e.dataTransfer)) return;
    e.preventDefault();
    editor.classList.add('drag-image-over');
  });

  editor.addEventListener('dragleave', (e) => {
    if (!editor.contains(e.relatedTarget)) editor.classList.remove('drag-image-over');
  });

  editor.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer?.files || []).filter(file => file.type.startsWith('image/'));
    if (!files.length) return;
    e.preventDefault();
    editor.classList.remove('drag-image-over');
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => insertImage(ev.target.result, { clientX: e.clientX, clientY: e.clientY });
      reader.readAsDataURL(file);
    });
  });
}

function hasImageFiles(dataTransfer) {
  if (!dataTransfer) return false;
  return Array.from(dataTransfer.items || []).some(item => item.kind === 'file' && item.type.startsWith('image/'));
}

function insertImage(dataURL, dropPoint = null) {
  const figure = document.createElement('figure');
  figure.className = 'frank-figure';
  figure.contentEditable = 'false';

  const container = document.createElement('div');
  container.className = 'frank-img-container';
  container.style.width = '400px';

  const img = document.createElement('img');
  img.src       = dataURL;
  img.className = 'frank-img';
  img.draggable = false;
  img.alt       = '';

  // Resize handle — top-right arrow
  const handle = document.createElement('button');
  handle.className = 'frank-img-resize-handle';
  handle.title = 'Drag to resize';
  handle.contentEditable = 'false';
  handle.innerHTML =
    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">` +
    `<line x1="4" y1="12" x2="12" y2="4"/>` +
    `<polyline points="12,4 12,9"/>` +
    `<polyline points="7,4 12,4"/>` +
    `</svg>`;

  container.appendChild(img);
  container.appendChild(handle);

  // Caption pill — div so it auto-expands with text
  const caption = document.createElement('div');
  caption.className = 'frank-img-caption frank-caption-empty';
  caption.contentEditable = 'true';
  caption.dataset.placeholder = 'Add caption…';

  figure.appendChild(container);
  figure.appendChild(caption);

  // ── Absolute canvas placement ──────────────────────────────────────────
  // The figure sits freely on the paper (position: absolute inside position: relative .paper).
  // Calculate initial position: centred horizontally, near the top of the visible viewport.
  const editorWs = document.querySelector('.editor-workspace');
  const scrollTop = editorWs ? editorWs.scrollTop : 0;
  const editorRect = editor.getBoundingClientRect();
  const dropLeft = dropPoint ? dropPoint.clientX - editorRect.left - 200 : null;
  const dropTop = dropPoint ? dropPoint.clientY - editorRect.top - 70 : null;
  const initialLeft = Math.max(16, Math.min(editor.offsetWidth - 140, Math.round(dropLeft ?? ((editor.offsetWidth - 420) / 2))));
  const initialTop  = Math.max(16, Math.round(dropTop ?? (scrollTop + 60)));
  figure.style.position = 'absolute';
  figure.style.left = `${initialLeft}px`;
  figure.style.top  = `${initialTop}px`;
  figure.style.margin = '0';
  editor.appendChild(figure);

  _makeImgResizable(figure);
  _setupCaption(figure);
  _setupFigureDrag(figure);
  markDirty();
  updatePageGuides();
}

function _makeImgResizable(figure) {
  const container = figure.querySelector('.frank-img-container');
  const handle    = figure.querySelector('.frank-img-resize-handle');
  if (!container || !handle || handle.dataset.resBound) return;
  handle.dataset.resBound = '1';

  let startX, startW, pendingW, resizeFrame = null;
  const paintWidth = () => {
    resizeFrame = null;
    if (pendingW) container.style.width = `${pendingW}px`;
  };
  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    startX = e.clientX;
    startW = container.offsetWidth;
    figure.classList.add('resizing');
    document.body.classList.add('is-resizing-widget');

    const onMove = (ev) => {
      pendingW = Math.max(80, Math.min(editor.offsetWidth - 24, startW + ev.clientX - startX));
      if (!resizeFrame) resizeFrame = requestAnimationFrame(paintWidth);
    };
    const onUp = () => {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = null;
      }
      if (pendingW) container.style.width = `${pendingW}px`;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      figure.classList.remove('resizing');
      document.body.classList.remove('is-resizing-widget');
      markDirty();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });
}

function _setupCaption(figure) {
  const caption = figure.querySelector('.frank-img-caption');
  if (!caption || caption.dataset.capBound) return;
  caption.dataset.capBound = '1';

  caption.addEventListener('focus', () => caption.classList.remove('frank-caption-empty'));
  caption.addEventListener('blur',  () => {
    if (caption.textContent.trim() === '') caption.classList.add('frank-caption-empty');
    markDirty();
  });
  caption.addEventListener('input', markDirty);
}

function _setupFigureDrag(figure) {
  if (figure.dataset.dragBound) return;
  figure.dataset.dragBound = '1';

  _setupFreeBlockDrag(figure, { ignore: '.frank-img-caption, .frank-img-resize-handle' });
}

function _setupFreeBlockDrag(block, options = {}) {
  if (!block || block.dataset.freeDragBound) return;
  block.dataset.freeDragBound = '1';
  const ignoreSelector = options.ignore || '';
  block.addEventListener('mousedown', e => {
    if (ignoreSelector && e.target.closest(ignoreSelector)) return;
    if (e.button !== 0) return;
    e.preventDefault();

    if (!block.style.position || block.style.position !== 'absolute') {
      const editorRect = editor.getBoundingClientRect();
      const blockRect = block.getBoundingClientRect();
      block.style.position = 'absolute';
      block.style.left = `${Math.max(16, Math.round(blockRect.left - editorRect.left))}px`;
      block.style.top = `${Math.max(16, Math.round(blockRect.top - editorRect.top + (document.querySelector('.editor-workspace')?.scrollTop || 0)))}px`;
      block.style.margin = '0';
    }

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startLeft = parseFloat(block.style.left) || 0;
    const startTop = parseFloat(block.style.top) || 0;
    const prevZ = block.style.zIndex;
    block.style.zIndex = '220';
    block.classList.add('dragging');

    const onMove = ev => {
      block.style.left = `${startLeft + ev.clientX - startMouseX}px`;
      block.style.top = `${startTop + ev.clientY - startMouseY}px`;
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      block.style.zIndex = prevZ;
      block.classList.remove('dragging');
      markDirty();
      syncActiveProjectFile();
      updatePageGuides();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// (image controls removed — images are now free-placed on the canvas)

function bindAllImages() {
  editor.querySelectorAll('.frank-figure').forEach(fig => {
    // Ensure absolute placement (in case document was saved before this version)
    if (!fig.style.position || fig.style.position !== 'absolute') {
      fig.style.position = 'absolute';
      if (!fig.style.left) fig.style.left = '60px';
      if (!fig.style.top)  fig.style.top  = '60px';
      fig.style.margin = '0';
    }
    _makeImgResizable(fig);
    _setupCaption(fig);
    _setupFigureDrag(fig);
  });
}

// ─────────────────────────────────────────────
// LIVE MERMAID-STYLE DIAGRAMS & LATEX-STYLE MATH
// ─────────────────────────────────────────────
const scheduleLiveRender = debounce(renderLiveEmbeds, 420);

function setupLiveRenderers() {
  renderLiveEmbeds();
}

function renderLiveEmbeds() {
  if (!editor) return;
  const caretOffset = currentEditorCaretOffset();
  editor.querySelectorAll('[data-live-render]').forEach(el => el.remove());
  renderSemanticBlocks();
  renderPageLinks();
  const renderedTags = renderHashtagTags();
  renderMathEmbeds();
  renderMermaidEmbeds();
  renderBacklinks();
  if (renderedTags && caretOffset !== null) restoreEditorCaretOffset(caretOffset);
}

function renderSemanticBlocks() {
  renderCalloutBlocks();
  renderTaskLists();
  renderFootnotes();
}

function renderCalloutBlocks() {
  editor.querySelectorAll('.frank-callout').forEach(block => {
    block.classList.remove('frank-callout', 'callout-note', 'callout-warning', 'callout-tip');
    block.querySelector('.callout-label')?.remove();
  });
  editor.querySelectorAll('blockquote').forEach(block => {
    if (block.closest('.code-block-wrapper, [data-live-render]')) return;
    const raw = (block.textContent || '').trim();
    const match = raw.match(/^\[!(NOTE|WARNING|TIP)\]\s*/i);
    if (!match) return;
    const kind = match[1].toLowerCase();
    block.classList.add('frank-callout', `callout-${kind}`);
    const firstText = firstTextNode(block);
    if (firstText) firstText.textContent = firstText.textContent.replace(/^\s*\[!(NOTE|WARNING|TIP)\]\s*/i, '');
    const label = document.createElement('div');
    label.className = 'callout-label';
    label.contentEditable = 'false';
    label.textContent = kind;
    block.prepend(label);
  });
}

function renderTaskLists() {
  editor.querySelectorAll('.frank-task-check').forEach(input => {
    const li = input.closest('li');
    if (li && !li.textContent.trim().match(/^\[[ x]\]/i)) {
      const marker = document.createTextNode(input.checked ? '[x] ' : '[ ] ');
      input.replaceWith(marker);
    }
  });
  editor.querySelectorAll('li').forEach(li => {
    if (li.closest('.code-block-wrapper, [data-live-render]') || li.querySelector('.frank-task-check')) return;
    const first = firstTextNode(li);
    if (!first) return;
    const match = first.textContent.match(/^\s*\[([ xX])\]\s*/);
    if (!match) return;
    first.textContent = first.textContent.slice(match[0].length);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'frank-task-check';
    checkbox.contentEditable = 'false';
    checkbox.checked = match[1].toLowerCase() === 'x';
    checkbox.addEventListener('change', () => {
      markDirty();
      syncActiveProjectFile();
    });
    li.classList.add('frank-task-item');
    li.prepend(checkbox);
  });
}

function renderFootnotes() {
  editor.querySelectorAll('.frank-footnote-ref').forEach(ref => {
    ref.replaceWith(document.createTextNode(`[^${ref.dataset.footnoteId || ref.textContent || '1'}]`));
  });
  editor.querySelectorAll('.frank-footnote-source-hidden').forEach(el => el.classList.remove('frank-footnote-source-hidden'));
  const definitions = new Map();
  Array.from(editor.querySelectorAll('p')).forEach(p => {
    if (p.closest('.code-block-wrapper, [data-live-render]')) return;
    const text = (p.textContent || '').trim();
    const match = text.match(/^\[\^([^\]]+)\]:\s*(.+)$/);
    if (!match) return;
    definitions.set(match[1], match[2]);
    p.classList.add('frank-footnote-source-hidden');
  });

  const used = [];
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('.code-block-wrapper, [data-live-render], a, .math-source-hidden, .frank-footnote-source-hidden')) return NodeFilter.FILTER_REJECT;
      return /\[\^([^\]]+)\]/.test(node.textContent || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const text = node.textContent || '';
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const match of text.matchAll(/\[\^([^\]]+)\]/g)) {
      frag.appendChild(document.createTextNode(text.slice(last, match.index)));
      const id = match[1];
      if (!used.includes(id)) used.push(id);
      const sup = document.createElement('sup');
      sup.className = 'frank-footnote-ref';
      sup.contentEditable = 'false';
      sup.dataset.footnoteId = id;
      sup.textContent = String(used.indexOf(id) + 1);
      sup.title = definitions.get(id) || id;
      frag.appendChild(sup);
      last = match.index + match[0].length;
    }
    frag.appendChild(document.createTextNode(text.slice(last)));
    node.replaceWith(frag);
  });

  if (!used.length) return;
  const panel = document.createElement('section');
  panel.className = 'footnotes-panel';
  panel.dataset.liveRender = 'footnotes';
  panel.contentEditable = 'false';
  panel.innerHTML = '<h3>Footnotes</h3>';
  const list = document.createElement('ol');
  used.forEach(id => {
    const item = document.createElement('li');
    item.textContent = definitions.get(id) || id;
    list.appendChild(item);
  });
  panel.appendChild(list);
  editor.appendChild(panel);
}

function firstTextNode(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  return walker.nextNode() ? walker.currentNode : null;
}

function renderMathEmbeds() {
  editor.querySelectorAll('.math-source-hidden').forEach(el => el.classList.remove('math-source-hidden'));
  const blocks = Array.from(editor.querySelectorAll('p, li, blockquote, h1, h2, h3, h4'))
    .filter(el => !el.closest('.code-block-wrapper, [data-live-render]'));
  blocks.forEach(block => {
    const text = block.textContent || '';
    const formulas = [
      ...[...text.matchAll(/\$\$([\s\S]+?)\$\$/g)].map(match => ({ source: match[1].trim(), display: true })),
      ...[...text.matchAll(/(^|[^$])\$([^$\n]+?)\$(?!\$)/g)].map(match => ({ source: match[2].trim(), display: false }))
    ].filter(item => item.source);
    if (!formulas.length) return;
    const card = document.createElement('div');
    card.className = 'live-render-card live-math-card';
    card.dataset.liveRender = 'math';
    card.contentEditable = 'false';
    card.title = 'Double-click to edit equation source';
    formulas.forEach(formula => {
      const render = document.createElement('div');
      render.className = formula.display ? 'mathjax-display' : 'mathjax-inline';
      render.textContent = formula.display ? `\\[${formula.source}\\]` : `\\(${formula.source}\\)`;
      card.appendChild(render);
    });
    card.appendChild(liveRenderDeleteButton('math'));
    card.addEventListener('dblclick', () => {
      block.classList.remove('math-source-hidden');
      block.classList.add('math-source-editing');
      card.remove();
      placeCaretAtEnd(block);
    });
    block.classList.add('math-source-hidden');
    block.after(card);
  });
  typesetMathCards();
}

function renderPageLinks() {
  const protectedTextNode = state.pageLinkDialogOpen ? activePageLinkDraftTextNode() : null;
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('.code-block-wrapper, [data-live-render], a, .math-source-hidden')) return NodeFilter.FILTER_REJECT;
      if (node === protectedTextNode) return NodeFilter.FILTER_REJECT;
      const text = node.textContent || '';
      return ((text.includes('<<') && text.includes('>>')) || (text.includes('[[') && text.includes(']]')))
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const frag = document.createDocumentFragment();
    const parts = node.textContent.split(/(<<[^<>]+>>|\[\[[^\[\]]+\]\])/g);
    parts.forEach(part => {
      const match = part.match(/^<<([^<>]+)>>$/) || part.match(/^\[\[([^\[\]]+)\]\]$/);
      if (!match) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const title = match[1].trim();
      if (!title) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const link = document.createElement('a');
      link.href = pageLinkHref(title);
      link.className = 'page-link';
      link.dataset.pageLink = title;
      link.title = `Open page: ${title}`;
      link.textContent = title;
      frag.appendChild(link);
    });
    node.replaceWith(frag);
  });
}

function renderHashtagTags() {
  editor.querySelectorAll('.frank-tag').forEach(tag => {
    tag.contentEditable = 'false';
    if (!tag.dataset.tag) tag.dataset.tag = (tag.textContent || '').replace(/^#/, '').toLowerCase();
  });
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('.code-block-wrapper, [data-live-render], a, .page-link, .frank-tag, .math-source-hidden')) {
        return NodeFilter.FILTER_REJECT;
      }
      return /(^|[\s([{])#[A-Za-z0-9][A-Za-z0-9_-]{0,31}\b/.test(node.textContent || '')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const text = node.textContent || '';
    const frag = document.createDocumentFragment();
    const re = /(^|[\s([{])#([A-Za-z0-9][A-Za-z0-9_-]{0,31})\b/g;
    let lastIndex = 0;
    let match;
    while ((match = re.exec(text))) {
      const matchStart = match.index;
      const prefix = match[1] || '';
      const tag = match[2];
      frag.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));
      if (prefix) frag.appendChild(document.createTextNode(prefix));
      const pill = document.createElement('span');
      pill.className = 'frank-tag';
      pill.dataset.tag = tag.toLowerCase();
      pill.contentEditable = 'false';
      pill.title = `Tag: #${tag}`;
      pill.textContent = `#${tag}`;
      frag.appendChild(pill);
      lastIndex = matchStart + prefix.length + tag.length + 1;
    }
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    node.replaceWith(frag);
  });
  return nodes.length > 0;
}

function currentEditorCaretOffset() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !sel.isCollapsed || !editor.contains(sel.anchorNode)) return null;
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
  return range.toString().length;
}

function restoreEditorCaretOffset(offset) {
  const range = rangeFromEditorTextOffsets(offset, offset);
  if (!range) return;
  const tag = range.startContainer.parentElement?.closest?.('.frank-tag');
  if (tag) {
    range.setStartAfter(tag);
    range.collapse(true);
  }
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  saveSelection();
}

function currentPageLinkDraftInfo() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !sel.isCollapsed || !editor.contains(sel.anchorNode)) return null;
  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(editor);
  beforeRange.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
  const caretOffset = beforeRange.toString().length;
  const text = editor.textContent || '';
  const before = text.slice(0, caretOffset);
  const completedDraft = before.match(/<<([^<>]*)>>$/);
  if (completedDraft) {
    return {
      startOffset: caretOffset - completedDraft[0].length,
      endOffset: caretOffset,
      query: completedDraft[1].trim()
    };
  }
  const beforeStart = before.lastIndexOf('<<');
  const beforeEnd = before.lastIndexOf('>>');
  const afterEnd = text.indexOf('>>', caretOffset);
  if (beforeStart === -1 || beforeStart <= beforeEnd || afterEnd === -1) return null;
  return {
    startOffset: beforeStart,
    endOffset: afterEnd + 2,
    query: text.slice(beforeStart + 2, afterEnd).trim()
  };
}

async function openPageLinkDialogFromDraft(draft) {
  if (state.pageLinkDialogOpen) return;
  state.pageLinkDialogOpen = true;
  const target = await showPageLinkDialog(draft.query || documentTitle.value || 'Untitled');
  state.pageLinkDialogOpen = false;
  if (!target) return;
  const range = rangeFromEditorTextOffsets(draft.startOffset, draft.endOffset);
  if (!range) return;
  const cleanTarget = target.trim();
  const html =
    `<a href="${pageLinkHref(cleanTarget)}" class="page-link" data-page-link="${escapeHTML(cleanTarget)}" title="Open page: ${escapeHTML(cleanTarget)}">` +
    `${escapeHTML(cleanTarget)}</a>`;
  range.deleteContents();
  const template = document.createElement('template');
  template.innerHTML = html;
  const link = template.content.firstElementChild;
  range.insertNode(link);
  const after = document.createRange();
  after.setStartAfter(link);
  after.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(after);
  saveSelection();
  markDirty();
  syncActiveProjectFile();
  scheduleLiveRender();
}

function activePageLinkDraftTextNode() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !sel.isCollapsed || !editor.contains(sel.anchorNode)) return null;
  const node = sel.anchorNode;
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const text = node.textContent || '';
  const offset = sel.getRangeAt(0).startOffset;
  const beforeStart = text.lastIndexOf('<<', offset);
  const beforeEnd = text.lastIndexOf('>>', offset);
  const afterEnd = text.indexOf('>>', offset);
  if (beforeStart !== -1 && beforeStart > beforeEnd && afterEnd !== -1) return node;
  return null;
}

function renderMermaidEmbeds() {
  if (window.mermaid && !window.__frankMermaidReady) {
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'neutral',
      flowchart: { htmlLabels: false }
    });
    window.__frankMermaidReady = true;
  }
  editor.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
    const code = wrapper.querySelector('code');
    if (!code) return;
    const source = normalizeMermaidSource(code.textContent || '');
    const lang = (code.className.match(/language-([^\s]+)/) || [])[1] || '';
    const headerText = wrapper.querySelector('.code-lang-tag')?.textContent?.trim().toLowerCase() || '';
    const isMermaid = lang.toLowerCase() === 'mermaid' || headerText === 'mermaid' || isLikelyMermaidSource(source);
    if (!isMermaid || !source) return;
    const card = document.createElement('div');
    card.className = 'live-render-card live-mermaid-card';
    card.dataset.liveRender = 'mermaid';
    card.contentEditable = 'false';
    renderMermaidOutput(source, card);
    card.appendChild(liveRenderDeleteButton('mermaid'));
    wrapper.appendChild(card);
  });
}

function normalizeMermaidSource(value) {
  let source = String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .trim();

  source = source
    .replace(/^```(?:mermaid)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const lines = source.split('\n');
  if (lines[0] && lines[0].trim().toLowerCase() === 'mermaid') {
    source = lines.slice(1).join('\n').trim();
  }

  return source;
}

function isLikelyMermaidSource(source) {
  return /^(flowchart|graph)\s+(td|tb|bt|rl|lr)\b/i.test(source) ||
    /^(sequenceDiagram|classDiagram|stateDiagram-v2|stateDiagram|erDiagram|journey|gantt|pie|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|C4Context)\b/i.test(source);
}

function mermaidFriendlyError(error) {
  const msg = error && error.message ? String(error.message) : '';
  if (/syntax error in text/i.test(msg) || /parse error/i.test(msg)) {
    return 'Mermaid could not parse this diagram. Start with valid Mermaid syntax, for example: flowchart LR\\n  A["Start"] --> B["Done"]';
  }
  return msg || 'Could not render this Mermaid diagram.';
}

function renderMermaidOutput(source, card) {
  const holder = document.createElement('div');
  holder.className = 'live-mermaid-output';
  holder.textContent = 'Rendering diagram...';
  card.appendChild(holder);
  if (!window.mermaid || !window.mermaid.render) {
    holder.textContent = 'Mermaid renderer unavailable';
    return;
  }
  const id = `frank-mermaid-${Date.now().toString(36)}-${state.mermaidRenderCount++}`;
  window.mermaid.render(id, source)
    .then(result => {
      if (!holder.isConnected) return;
      holder.innerHTML = result.svg || '';
      holder.querySelector('svg')?.removeAttribute('height');
    })
    .catch(error => {
      holder.classList.add('live-mermaid-error');
      holder.textContent = mermaidFriendlyError(error);
    });
}

function liveRenderDeleteButton(kind) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'live-render-delete';
  btn.dataset.liveDelete = kind;
  btn.textContent = 'Delete';
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const card = btn.closest('[data-live-render]');
    if (!card) return;
    if (kind === 'math') {
      const source = card.previousElementSibling;
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      card.before(p);
      if (source && source.classList.contains('math-source-hidden')) source.remove();
      card.remove();
      placeCaretAtEnd(p);
    } else if (kind === 'mermaid') {
      const wrapper = card.closest('.code-block-wrapper');
      if (wrapper) {
        deleteCodeBlock(wrapper);
        return;
      }
      card.remove();
    }
    markDirty();
    syncActiveProjectFile();
    updateStats();
    updatePageGuides();
  });
  return btn;
}

function typesetMathCards() {
  const cards = Array.from(editor.querySelectorAll('.live-math-card'));
  if (!cards.length || !window.MathJax) return;
  const run = () => window.MathJax.typesetPromise(cards).catch(() => {});
  if (window.MathJax.startup && window.MathJax.startup.promise) {
    window.MathJax.startup.promise.then(run);
  } else if (window.MathJax.typesetPromise) {
    run();
  }
}

function insertMathBlock() {
  restoreSelection();
  document.execCommand('insertHTML', false, '<p>$$e = mc^2$$</p>');
  markDirty();
  scheduleLiveRender();
}

async function insertPageLinkFromSelection() {
  restoreSelection();
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  let range = sel.getRangeAt(0);
  const activeLink = selectionElement(sel)?.closest?.('.page-link');
  if (activeLink) {
    const currentTarget = normalizePageTitle(activeLink.dataset.pageLink || activeLink.getAttribute('href') || activeLink.textContent);
    const target = await showPageLinkDialog(currentTarget || activeLink.textContent.trim());
    if (!target) return;
    activeLink.dataset.pageLink = target.trim();
    activeLink.href = pageLinkHref(target);
    activeLink.title = `Open page: ${target.trim()}`;
    markDirty();
    syncActiveProjectFile();
    return;
  }

  if (range.collapsed) {
    const wordRange = currentWordRange(range);
    if (wordRange) {
      sel.removeAllRanges();
      sel.addRange(wordRange);
      range = wordRange;
    }
  }

  const label = sel.toString().trim();
  const target = await showPageLinkDialog(label || documentTitle.value || 'Untitled');
  if (!target) return;
  const cleanTarget = target.trim();
  const cleanLabel = label || cleanTarget;
  const html =
    `<a href="${pageLinkHref(cleanTarget)}" class="page-link" data-page-link="${escapeHTML(cleanTarget)}" title="Open page: ${escapeHTML(cleanTarget)}">` +
    `${escapeHTML(cleanLabel)}</a>`;
  document.execCommand('insertHTML', false, html);
  markDirty();
  syncActiveProjectFile();
}

function currentWordRange(range) {
  const node = range.startContainer;
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  const text = node.textContent || '';
  const offset = range.startOffset;
  const left = text.slice(0, offset).match(/[^\s.,;:!?()[\]{}"'`]+$/);
  const right = text.slice(offset).match(/^[^\s.,;:!?()[\]{}"'`]+/);
  const start = offset - (left ? left[0].length : 0);
  const end = offset + (right ? right[0].length : 0);
  if (start === end) return null;
  const wordRange = document.createRange();
  wordRange.setStart(node, start);
  wordRange.setEnd(node, end);
  return wordRange;
}

function pageLinkHref(title) {
  return `#${encodeURIComponent(String(title || '').trim())}`;
}

function normalizePageTitle(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withoutHash = raw.startsWith('#') ? raw.slice(1) : raw;
  try {
    return decodeURIComponent(withoutHash).trim();
  } catch (_) {
    return withoutHash.trim();
  }
}

function allProjectPages() {
  const activeId = state.activeProjectId;
  const projects = [
    ...state.projects.filter(project => project.id === activeId),
    ...state.projects.filter(project => project.id !== activeId)
  ];
  const seen = new Set();
  const pages = [];
  projects.forEach(project => {
    project.files.forEach(file => {
      const title = (file.title || 'Untitled').trim();
      const key = title.toLowerCase();
      if (!title || seen.has(key)) return;
      seen.add(key);
      pages.push({ title, projectName: project.name });
    });
  });
  return pages;
}

function pageLinksFromHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const links = new Map();
  template.content.querySelectorAll('.page-link, [data-page-link]').forEach(link => {
    const title = normalizePageTitle(link.dataset.pageLink || link.getAttribute('href') || link.textContent);
    if (title) links.set(pageKey(title), title);
  });
  const text = template.content.textContent || '';
  for (const match of text.matchAll(/\[\[([^\[\]]+)\]\]|<<([^<>]+)>>/g)) {
    const title = normalizePageTitle(match[1] || match[2] || '');
    if (title) links.set(pageKey(title), title);
  }
  return links;
}

function renderBacklinks() {
  if (!backlinksPanel || !backlinksList || !backlinksCount) return;
  const currentFile = activeProjectFile();
  const currentTitle = documentTitle.value || currentFile?.title || '';
  const currentKey = pageKey(currentTitle);
  if (!currentKey) {
    backlinksCount.textContent = '0';
    backlinksList.innerHTML = '<span class="backlinks-empty">No backlinks yet</span>';
    backlinksPanel.classList.add('hidden');
    backlinksPanel.setAttribute('aria-hidden', 'true');
    return;
  }

  const matches = [];
  state.projects.forEach(project => {
    project.files.forEach(file => {
      if (file.id === state.activeProjectFileId) return;
      const links = pageLinksFromHTML(file.html || '');
      if (links.has(currentKey)) {
        matches.push({ project, file, excerpt: backlinkExcerpt(file.html || '', currentTitle) });
      }
    });
  });

  backlinksCount.textContent = String(matches.length);
  if (!matches.length) {
    backlinksList.innerHTML = '<span class="backlinks-empty">No backlinks yet</span>';
    backlinksPanel.classList.add('hidden');
    backlinksPanel.setAttribute('aria-hidden', 'true');
    return;
  }

  backlinksPanel.classList.remove('hidden');
  backlinksPanel.setAttribute('aria-hidden', 'false');
  backlinksList.innerHTML = '';
  matches.forEach(({ project, file, excerpt }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'backlink-item';
    btn.innerHTML = `<span>${escapeHTML(file.title || 'Untitled')}</span><small>${escapeHTML(project.name || 'Workspace')}</small>${excerpt ? `<em>${escapeHTML(excerpt)}</em>` : ''}`;
    btn.addEventListener('click', () => loadProjectFile(project.id, file.id));
    backlinksList.appendChild(btn);
  });
}

function pageKey(title) {
  return normalizePageTitle(title).replace(/\s+/g, ' ').trim().toLowerCase();
}

function backlinkExcerpt(html, targetTitle) {
  const text = htmlToPlainText(html);
  const needles = [
    `[[${targetTitle}]]`,
    `<<${targetTitle}>>`,
    targetTitle
  ].map(item => item.toLowerCase());
  const lower = text.toLowerCase();
  let idx = -1;
  let needle = '';
  for (const item of needles) {
    idx = lower.indexOf(item);
    if (idx !== -1) {
      needle = item;
      break;
    }
  }
  if (idx === -1) return text.slice(0, 120);
  return text.slice(Math.max(0, idx - 48), idx + needle.length + 72).trim();
}

function showPageLinkDialog(seed = '') {
  saveSelection();
  const pages = allProjectPages();
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'link-dialog-overlay';
    overlay.innerHTML = `
      <div class="link-dialog" role="dialog" aria-modal="true" aria-label="Link to page">
        <label class="link-dialog-label" for="link-dialog-input">Link word to page</label>
        <input id="link-dialog-input" class="link-dialog-input" list="link-dialog-pages" value="${escapeHTML(seed)}" autocomplete="off" spellcheck="false">
        <datalist id="link-dialog-pages">
          ${pages.map(page => `<option value="${escapeHTML(page.title)}">${escapeHTML(page.projectName)}</option>`).join('')}
        </datalist>
        <div class="link-suggestions" role="listbox" aria-label="Pages">
          ${pages.length
            ? pages.map(page => `<button type="button" class="link-suggestion" data-title="${escapeHTML(page.title)}"><span>${escapeHTML(page.title)}</span><small>${escapeHTML(page.projectName)}</small></button>`).join('')
            : '<div class="link-suggestion-empty">No pages yet</div>'}
        </div>
        <div class="link-dialog-hint">${pages.length ? 'Choose an existing page or type a new one.' : 'Type a new page name.'}</div>
        <div class="link-dialog-actions">
          <button type="button" class="link-dialog-btn" data-action="cancel">Cancel</button>
          <button type="button" class="link-dialog-btn primary" data-action="link">Link</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('.link-dialog-input');
    const finish = value => {
      overlay.remove();
      restoreSelection();
      resolve((value || '').trim());
    };
    overlay.addEventListener('mousedown', e => {
      const suggestion = e.target.closest('.link-suggestion');
      if (suggestion) finish(suggestion.dataset.title || suggestion.textContent);
      if (e.target === overlay || e.target.dataset.action === 'cancel') finish('');
      if (e.target.dataset.action === 'link') finish(input.value);
    });
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish('');
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        finish(input.value);
      }
    });
    setTimeout(() => {
      input.focus();
      input.select();
    }, 20);
  });
}

function insertMermaidBlock() {
  insertEmptyCodeBlock('mermaid');
  const wrappers = editor.querySelectorAll('.code-block-wrapper');
  const code = wrappers[wrappers.length - 1]?.querySelector('code');
  if (code) {
    code.textContent = 'flowchart LR\n  A["Frank"] --> B["Math SVG"]\n  A --> C["Mermaid SVG"]';
    code.className = 'language-mermaid';
    const tag = code.closest('.code-block-wrapper')?.querySelector('.code-lang-tag');
    if (tag) tag.textContent = 'mermaid';
    refreshCodeLineNums(code);
    scheduleLiveRender();
  }
}

function insertCalloutBlock(kind = 'NOTE') {
  restoreSelection();
  const safeKind = ['NOTE', 'WARNING', 'TIP'].includes(String(kind).toUpperCase()) ? String(kind).toUpperCase() : 'NOTE';
  document.execCommand('insertHTML', false, `<blockquote>[!${safeKind}]<br>Write the callout text here.</blockquote><p><br></p>`);
  markDirty();
  scheduleLiveRender();
}

function insertTaskList() {
  restoreSelection();
  document.execCommand('insertHTML', false, '<ul><li>[ ] </li></ul><p><br></p>');
  markDirty();
  scheduleLiveRender();
}

function insertFootnote() {
  restoreSelection();
  document.execCommand('insertHTML', false, '<span>[^1]</span><p>[^1]: Footnote text.</p>');
  markDirty();
  scheduleLiveRender();
}

function exportPresentation() {
  const slides = [];
  let current = { title: documentTitle.value || 'Untitled', html: '' };
  Array.from(cleanEditorCloneForStorage().children).forEach(node => {
    if (node.tagName === 'H1') {
      if (current.html.trim()) slides.push(current);
      current = { title: node.textContent.trim() || 'Untitled', html: '' };
    } else {
      current.html += node.outerHTML || '';
    }
  });
  slides.push(current);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHTML(documentTitle.value || 'Presentation')}</title><style>
html,body{margin:0;background:#0f141c;color:#f8fafc;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;height:100%;overflow:hidden}
.deck{display:flex;height:100vh;transition:transform .28s ease}.slide{min-width:100vw;height:100vh;box-sizing:border-box;padding:8vh 10vw;display:flex;flex-direction:column;justify-content:center;gap:1.4rem}
h1{font-size:clamp(2.4rem,6vw,5.8rem);line-height:1;margin:0}p,li{font-size:clamp(1.1rem,2vw,1.7rem);line-height:1.55}pre{background:#111827;border-radius:14px;padding:1rem;overflow:auto}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.hint{position:fixed;right:18px;bottom:16px;color:#94a3b8;font-size:12px}
</style></head><body><div class="deck">${slides.map(slide => `<section class="slide"><h1>${escapeHTML(slide.title)}</h1><div>${slide.html}</div></section>`).join('')}</div><div class="hint">← →</div><script>
let i=0;const deck=document.querySelector('.deck'),n=document.querySelectorAll('.slide').length;function paint(){deck.style.transform='translateX('+(-i*100)+'vw)'}addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' '){i=Math.min(n-1,i+1);paint()}if(e.key==='ArrowLeft'){i=Math.max(0,i-1);paint()}})
</script></body></html>`;
  triggerFileDownload(html, 'text/html;charset=utf-8', '-presentation.html');
}

async function publishToDataURL() {
  const html = buildExportHTML();
  exportMenu && exportMenu.classList.remove('active');
  window.__frankPendingPublishHTML = html;

  if (nativePost({
    action: 'publishHTML',
    filename: `${safeDocumentTitle()}-published.html`,
    content: html
  })) {
    setSaveStatus('Publishing locally...');
    return;
  }

  const localURL = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const copied = await copyTextToClipboard(localURL);
  setSaveStatus(copied ? 'Local preview URL copied' : 'Local preview ready');
  showPublishURLPanel(localURL, html, copied, {
    local: true,
    note: 'This preview URL works in this browser session. Download the HTML file to share it.'
  });
}

async function copyTextToClipboard(value) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (_) {}

  const box = document.createElement('textarea');
  box.value = value;
  box.setAttribute('readonly', '');
  box.style.position = 'fixed';
  box.style.left = '-9999px';
  document.body.appendChild(box);
  box.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
  box.remove();
  return ok;
}

window.frankNativeDidPublish = async function(result) {
  const html = window.__frankPendingPublishHTML || buildExportHTML();
  if (!result || !result.ok || !result.url) {
    setSaveStatus('Publish failed');
    showPublishURLPanel('', html, false, {
      error: result && result.error ? result.error : 'Could not create a local URL.',
      note: 'Download the HTML file instead.'
    });
    return;
  }
  const copied = await copyTextToClipboard(result.url);
  setSaveStatus(copied ? 'Local URL copied' : 'Local URL ready');
  showPublishURLPanel(result.url, html, copied, {
    local: Boolean(result.local),
    note: 'This is a real localhost URL while frank is open. Use Download HTML for a file you can email or upload.'
  });
};

function showPublishURLPanel(publishURL, html, copied, options = {}) {
  document.querySelectorAll('.publish-overlay').forEach(el => el.remove());
  const overlay = document.createElement('div');
  overlay.className = 'frank-overlay publish-overlay';
  const statusText = options.error
    ? escapeHTML(options.error)
    : copied
      ? 'Copied the local published URL to the clipboard.'
      : 'Your local published URL is ready.';
  const value = publishURL || '';
  overlay.innerHTML = `
    <div class="frank-panel publish-panel" role="dialog" aria-modal="true" aria-label="Publish URL">
      <div class="frank-panel-header">
        <h2>Local Publish URL</h2>
        <button type="button" data-close aria-label="Close">×</button>
      </div>
      <p class="publish-status">${statusText}</p>
      ${options.note ? `<p class="publish-note">${escapeHTML(options.note)}</p>` : ''}
      <textarea class="publish-url-field" readonly spellcheck="false" placeholder="No URL available">${escapeHTML(value)}</textarea>
      <div class="publish-actions">
        <button type="button" class="action-btn primary" data-copy>Copy URL</button>
        <button type="button" class="action-btn" data-open>Open</button>
        <button type="button" class="action-btn" data-download>Download HTML</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
    editor.focus();
  };
  const field = overlay.querySelector('.publish-url-field');
  field.focus();
  field.select();
  overlay.addEventListener('click', async e => {
    if (e.target === overlay || e.target.closest('[data-close]')) close();
    if (e.target.closest('[data-copy]')) {
      if (!publishURL) return;
      const ok = await copyTextToClipboard(publishURL);
      overlay.querySelector('.publish-status').textContent = ok ? 'Copied to clipboard.' : 'Select the URL and copy it manually.';
      field.focus();
      field.select();
    }
    if (e.target.closest('[data-open]')) {
      if (!publishURL) return;
      const opened = window.open(publishURL, '_blank', 'noopener');
      if (!opened) overlay.querySelector('.publish-status').textContent = 'Pop-up blocked. Copy the URL and paste it into a browser.';
    }
    if (e.target.closest('[data-download]')) {
      triggerFileDownload(html, 'text/html;charset=utf-8', '-published.html');
    }
  });
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

// ─────────────────────────────────────────────
// PROJECT PANEL
// ─────────────────────────────────────────────
function setupProjectPanel() {
  loadProjects();
  if (!state.projects.length) seedDefaultProject();
  activeTabId = state.activeProjectFileId || activeProjectFile()?.id || activeTabId;
  renderProjectPanel();
  renderTabs();
  updateFocusPanelState();

  projectPanelToggle && projectPanelToggle.addEventListener('click', () => {
    state.projectPanelCollapsed = !state.projectPanelCollapsed;
    appBody && appBody.classList.toggle('project-panel-collapsed', state.projectPanelCollapsed);
    projectPanelToggle.setAttribute('aria-expanded', String(!state.projectPanelCollapsed));
    updateFocusPanelState();
    persistProjects();
  });

  projectNewBtn && projectNewBtn.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
  });
  projectNewBtn && projectNewBtn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    createProject();
  });
  projectPanel && projectPanel.addEventListener('click', e => {
    if (!e.target.closest('#project-new')) return;
    e.preventDefault();
    e.stopPropagation();
    createProject();
  });
  projectFileNewBtn && projectFileNewBtn.addEventListener('click', () => createProjectFile(state.activeProjectId));
  projectSearch && projectSearch.addEventListener('input', renderProjectPanel);
}

function projectId(prefix = 'p') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem('frank:projects') || '{}');
    state.projects = Array.isArray(saved.projects) ? saved.projects : [];
    state.activeProjectId = saved.activeProjectId || state.projects[0]?.id || null;
    state.activeProjectFileId = saved.activeProjectFileId || null;
    state.projectPanelCollapsed = Boolean(saved.projectPanelCollapsed);
    appBody && appBody.classList.toggle('project-panel-collapsed', state.projectPanelCollapsed);
    projectPanelToggle && projectPanelToggle.setAttribute('aria-expanded', String(!state.projectPanelCollapsed));
  } catch (e) {
    state.projects = [];
  }
}

function persistProjects() {
  localStorage.setItem('frank:projects', JSON.stringify({
    projects: state.projects,
    activeProjectId: state.activeProjectId,
    activeProjectFileId: state.activeProjectFileId,
    projectPanelCollapsed: state.projectPanelCollapsed
  }));
}

function seedDefaultProject() {
  const file = {
    id: projectId('f'),
    title: documentTitle.value || 'Welcome',
    html: editor.innerHTML,
    updatedAt: Date.now()
  };
  const project = { id: projectId('p'), name: 'Frank Workspace', collapsed: false, files: [file] };
  state.projects = [project];
  state.activeProjectId = project.id;
  state.activeProjectFileId = file.id;
  persistProjects();
}

function activeProject() {
  return state.projects.find(project => project.id === state.activeProjectId) || state.projects[0] || null;
}

function activeProjectFile() {
  const project = activeProject();
  return project ? project.files.find(file => file.id === state.activeProjectFileId) || project.files[0] || null : null;
}

function syncActiveProjectFile() {
  const file = activeProjectFile();
  if (!file) return;
  file.title = documentTitle.value || 'Untitled';
  file.html = cleanEditorCloneForStorage().innerHTML;
  file.updatedAt = Date.now();
  persistProjects();
  renderProjectPanel();
  renderTabs();
  renderBacklinks();
}

function nextWorkspaceName() {
  const existing = new Set(state.projects.map(project => String(project.name || '').trim().toLowerCase()));
  let index = state.projects.length + 1;
  let name = `Workspace ${index}`;
  while (existing.has(name.toLowerCase())) {
    index += 1;
    name = `Workspace ${index}`;
  }
  return name;
}

function createProject() {
  const name = nextWorkspaceName();
  const file = { id: projectId('f'), title: 'Untitled', html: '<h1>Untitled</h1><p><br></p>', updatedAt: Date.now() };
  const project = { id: projectId('p'), name, collapsed: false, files: [file] };
  state.projects.unshift(project);
  state.activeProjectId = project.id;
  state.activeProjectFileId = file.id;
  activeTabId = file.id;
  if (projectSearch) projectSearch.value = '';
  if (state.projectPanelCollapsed) {
    state.projectPanelCollapsed = false;
    appBody && appBody.classList.remove('project-panel-collapsed');
    projectPanelToggle && projectPanelToggle.setAttribute('aria-expanded', 'true');
  }
  persistProjects();
  loadProjectFile(project.id, file.id);
  updateFocusPanelState();
}

function workspace() {
  createProject();
}

function createProjectFile(projectIdValue, options = {}) {
  const project = state.projects.find(item => item.id === projectIdValue) || activeProject();
  if (!project) return;
  const promptForName = options.promptForName !== false;
  const title = options.title || (promptForName ? prompt('File name', 'Untitled') : 'Untitled') || 'Untitled';
  const cleanTitle = title.trim() || 'Untitled';
  const file = { id: projectId('f'), title: cleanTitle, html: `<h1>${escapeHTML(cleanTitle)}</h1><p><br></p>`, updatedAt: Date.now() };
  project.files.unshift(file);
  state.activeProjectId = project.id;
  state.activeProjectFileId = file.id;
  activeTabId = file.id;
  persistProjects();
  loadProjectFile(project.id, file.id);
}

function openProjectPage(title) {
  const cleanTitle = normalizePageTitle(title);
  if (!cleanTitle) return;
  let project = activeProject();
  if (!project) {
    seedDefaultProject();
    project = activeProject();
  }
  let file = null;
  let ownerProject = null;
  const orderedProjects = [
    ...state.projects.filter(item => item.id === state.activeProjectId),
    ...state.projects.filter(item => item.id !== state.activeProjectId)
  ];
  orderedProjects.some(item => {
    const match = item.files.find(fileItem => (fileItem.title || '').toLowerCase() === cleanTitle.toLowerCase());
    if (!match) return false;
    file = match;
    ownerProject = item;
    return true;
  });
  if (!file) {
    file = {
      id: projectId('f'),
      title: cleanTitle,
      html: `<h1>${escapeHTML(cleanTitle)}</h1><p><br></p>`,
      updatedAt: Date.now()
    };
    project.files.unshift(file);
    ownerProject = project;
  }
  state.activeProjectId = ownerProject.id;
  state.activeProjectFileId = file.id;
  activeTabId = file.id;
  persistProjects();
  loadProjectFile(ownerProject.id, file.id);
}

function loadProjectFile(projectIdValue, fileIdValue) {
  const currentId = state.activeProjectFileId;
  if (currentId && currentId !== fileIdValue) syncActiveProjectFile();
  const project = state.projects.find(item => item.id === projectIdValue);
  const file = project && project.files.find(item => item.id === fileIdValue);
  if (!project || !file) return;
  state.activeProjectId = project.id;
  state.activeProjectFileId = file.id;
  activeTabId = file.id;
  documentTitle.value = file.title || 'Untitled';
  editor.innerHTML = file.html || '<p><br></p>';
  state.filePath = null;
  state.isDirty = false;
  bindAllCodeBlocks();
  bindAllTables();
  bindAllImages();
  bindEmbedBlocks();
  updateStats();
  updateWindowTitle();
  updatePageGuides();
  renderBacklinks();
  persistProjects();
  renderProjectPanel();
  renderTabs();
  editor.focus();
}

function renderProjectPanel() {
  if (!projectList) return;
  projectList.innerHTML = '';
  const query = (projectSearch && projectSearch.value || '').trim().toLowerCase();
  state.projects.forEach(project => {
    const visibleFiles = query
      ? project.files.filter(file => (file.title || '').toLowerCase().includes(query))
      : project.files;
    if (query && !visibleFiles.length && !project.name.toLowerCase().includes(query)) return;

    const group = document.createElement('section');
    group.className = 'project-group';
    group.classList.toggle('active', project.id === state.activeProjectId);
    group.classList.toggle('collapsed', Boolean(project.collapsed) && !query);

    const head = document.createElement('div');
    head.className = 'project-row project-name-row';
    head.setAttribute('role', 'button');
    head.tabIndex = 0;
    head.setAttribute('aria-expanded', String(!(project.collapsed && !query)));
    head.innerHTML = `
      <span class="project-chevron">▾</span>
      <span class="project-name-text" title="Hold for 1.5 seconds to rename">${escapeHTML(project.name)}</span>
      <span class="project-count">${project.files.length} ${project.files.length === 1 ? 'page' : 'pages'}</span>
      <button type="button" class="workspace-delete-btn" data-workspace-action="delete" aria-label="Delete ${escapeHTML(project.name)}" title="Delete workspace">⌫</button>`;
    const projectNameText = head.querySelector('.project-name-text');
    let renameHoldTimer = null;
    let longPressRenameFired = false;
    const clearRenameHold = () => {
      window.clearTimeout(renameHoldTimer);
      renameHoldTimer = null;
      projectNameText?.classList.remove('renaming-hold');
    };
    const startRenameHold = e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      clearRenameHold();
      projectNameText?.classList.add('renaming-hold');
      renameHoldTimer = window.setTimeout(() => {
        longPressRenameFired = true;
        clearRenameHold();
        beginRenameProject(project, head);
      }, 1500);
    };
    const toggleProject = () => {
      project.collapsed = !project.collapsed;
      persistProjects();
      renderProjectPanel();
    };
    head.addEventListener('click', e => {
      if (e.target.closest('.project-name-input')) return;
      if (e.target.closest('[data-workspace-action="delete"]')) {
        e.preventDefault();
        e.stopPropagation();
        removeProject(project);
        return;
      }
      if (longPressRenameFired) {
        e.preventDefault();
        longPressRenameFired = false;
        return;
      }
      toggleProject();
    });
    projectNameText?.addEventListener('pointerdown', startRenameHold);
    projectNameText?.addEventListener('pointerup', clearRenameHold);
    projectNameText?.addEventListener('pointerleave', clearRenameHold);
    projectNameText?.addEventListener('pointercancel', clearRenameHold);
    head.addEventListener('keydown', e => {
      if (e.target.closest('.project-name-input')) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      toggleProject();
    });
    group.appendChild(head);

    const files = document.createElement('div');
    files.className = 'project-file-list';
    visibleFiles.forEach(file => {
      const row = document.createElement('div');
      row.className = 'project-row project-file-row';
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      row.draggable = true;
      row.classList.toggle('active', project.id === state.activeProjectId && file.id === state.activeProjectFileId);
      row.innerHTML = `
        <span class="file-dot"></span>
        <span class="file-copy">
          <span class="file-title">${escapeHTML(file.title || 'Untitled')}</span>
          <span class="file-meta">${formatProjectFileMeta(file)}</span>
        </span>
        <span class="file-actions" aria-label="Page actions">
          <button type="button" class="file-action-btn" data-file-action="rename" aria-label="Rename page" title="Rename page">✎</button>
          <button type="button" class="file-action-btn danger" data-file-action="remove" aria-label="Remove page" title="Remove page">×</button>
        </span>`;
      row.addEventListener('click', e => {
        if (e.target.closest('.project-file-input')) return;
        const action = e.target.closest('[data-file-action]');
        if (action) {
          e.preventDefault();
          e.stopPropagation();
          if (action.dataset.fileAction === 'rename') beginRenameProjectFile(project, file, row);
          if (action.dataset.fileAction === 'remove') removeProjectFile(project, file);
          return;
        }
        loadProjectFile(project.id, file.id);
      });
      row.addEventListener('keydown', e => {
        if (e.target.closest('.project-file-input')) return;
        if (e.key === 'F2') {
          e.preventDefault();
          beginRenameProjectFile(project, file, row);
          return;
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          removeProjectFile(project, file);
          return;
        }
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        loadProjectFile(project.id, file.id);
      });
      row.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ projectId: project.id, fileId: file.id }));
        e.dataTransfer.effectAllowed = 'move';
        row.classList.add('dragging');
      });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', e => {
        e.preventDefault();
        row.classList.add('drag-over');
      });
      row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
      row.addEventListener('drop', e => {
        e.preventDefault();
        row.classList.remove('drag-over');
        try {
          const payload = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
          moveProjectFile(payload.projectId, payload.fileId, project.id, file.id);
        } catch (_) {}
      });
      files.appendChild(row);
    });
    group.appendChild(files);
    projectList.appendChild(group);
  });
}

function moveProjectFile(fromProjectId, fileId, toProjectId, beforeFileId) {
  if (!fromProjectId || !fileId || !toProjectId || !beforeFileId) return;
  const fromProject = state.projects.find(project => project.id === fromProjectId);
  const toProject = state.projects.find(project => project.id === toProjectId);
  if (!fromProject || !toProject) return;
  const fromIndex = fromProject.files.findIndex(file => file.id === fileId);
  if (fromIndex === -1 || fileId === beforeFileId) return;
  const [file] = fromProject.files.splice(fromIndex, 1);
  let toIndex = toProject.files.findIndex(item => item.id === beforeFileId);
  if (toIndex === -1) toIndex = toProject.files.length;
  toProject.files.splice(toIndex, 0, file);
  state.activeProjectId = toProject.id;
  state.activeProjectFileId = file.id;
  activeTabId = file.id;
  persistProjects();
  renderProjectPanel();
  renderTabs();
  renderBacklinks();
}

function formatProjectFileMeta(file) {
  const updated = file.updatedAt ? new Date(file.updatedAt) : null;
  const stamp = updated
    ? updated.toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'Draft';
  const text = String(file.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  return `${stamp} · ${words} words`;
}

function renameProject(project) {
  if (!project) return;
  const next = prompt('Workspace name', project.name || 'Workspace');
  if (next == null) return;
  const clean = next.trim();
  if (!clean) return;
  project.name = clean;
  persistProjects();
  renderProjectPanel();
}

function beginRenameProject(project, row) {
  if (!project || !row) return;
  const label = row.querySelector('.project-name-text');
  if (!label || row.querySelector('.project-name-input')) {
    row.querySelector('.project-name-input')?.focus();
    return;
  }
  const input = document.createElement('input');
  input.className = 'project-name-input';
  input.type = 'text';
  input.value = project.name || 'Workspace';
  input.setAttribute('aria-label', 'Workspace name');
  label.replaceWith(input);
  const finish = commit => {
    const next = input.value.trim();
    if (commit && next) {
      project.name = next;
      persistProjects();
    }
    renderProjectPanel();
  };
  input.addEventListener('click', e => e.stopPropagation());
  input.addEventListener('mousedown', e => e.stopPropagation());
  input.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      finish(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finish(false);
    }
  });
  input.addEventListener('blur', () => finish(true));
  requestAnimationFrame(() => {
    input.focus();
    input.select();
  });
}

function beginRenameProjectFile(project, file, row) {
  if (!project || !file || !row) return;
  const label = row.querySelector('.file-title');
  if (!label || row.querySelector('.project-file-input')) {
    row.querySelector('.project-file-input')?.focus();
    return;
  }
  const input = document.createElement('input');
  input.className = 'project-file-input';
  input.type = 'text';
  input.value = file.title || 'Untitled';
  input.setAttribute('aria-label', 'Page name');
  label.replaceWith(input);
  const finish = commit => {
    const next = input.value.trim();
    if (commit && next) {
      file.title = next;
      file.updatedAt = Date.now();
      if (project.id === state.activeProjectId && file.id === state.activeProjectFileId) {
        documentTitle.value = next;
        updateWindowTitle();
      }
      persistProjects();
      renderTabs();
    }
    renderProjectPanel();
  };
  input.addEventListener('click', e => e.stopPropagation());
  input.addEventListener('mousedown', e => e.stopPropagation());
  input.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      finish(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finish(false);
    }
  });
  input.addEventListener('blur', () => finish(true));
  requestAnimationFrame(() => {
    input.focus();
    input.select();
  });
}

function removeProject(project) {
  if (!project) return;
  syncActiveProjectFile();
  const wasActive = project.id === state.activeProjectId;
  state.projects = state.projects.filter(item => item.id !== project.id);
  if (!state.projects.length) seedDefaultProject();

  if (wasActive) {
    const nextProject = state.projects[0];
    const nextFile = nextProject && nextProject.files[0];
    if (nextProject && nextFile) {
      state.activeProjectId = nextProject.id;
      state.activeProjectFileId = nextFile.id;
      activeTabId = nextFile.id;
      persistProjects();
      loadProjectFile(nextProject.id, nextFile.id);
      return;
    }
  }

  persistProjects();
  renderProjectPanel();
  renderTabs();
}

function removeProjectFile(project, file) {
  if (!project || !file) return;
  const wasActiveProject = project.id === state.activeProjectId;
  const wasActiveFile = wasActiveProject && file.id === state.activeProjectFileId;
  if (wasActiveProject && !wasActiveFile) {
    syncActiveProjectFile();
  }
  const remainingFiles = project.files.filter(item => item.id !== file.id);
  const needsReplacementPage = wasActiveFile && !remainingFiles.length;
  project.files = needsReplacementPage
    ? [{
        id: projectId('f'),
        title: 'Untitled',
        html: '<h1>Untitled</h1><p><br></p>',
        updatedAt: Date.now()
      }]
    : remainingFiles;

  if (wasActiveFile) {
    const nextFile = project.files[0] || activeProjectFile();
    if (nextFile) {
      state.activeProjectId = project.id;
      state.activeProjectFileId = nextFile.id;
      activeTabId = nextFile.id;
      persistProjects();
      loadProjectFile(project.id, nextFile.id);
      return;
    }
  }

  if (activeTabId === file.id) activeTabId = state.activeProjectFileId;
  persistProjects();
  renderProjectPanel();
  renderTabs();
}

// ─────────────────────────────────────────────
// FRANK 2 FLOATING CONTROLS
// ─────────────────────────────────────────────
function setupFloatingContextToolbar() {
  if (!contextToolbar) return;

  ctxFont && ctxFont.addEventListener('change', () => {
    applyFontToSelection(ctxFont.value);
    editor.focus();
  });
  ctxFontDec && ctxFontDec.addEventListener('mousedown', e => {
    e.preventDefault();
    stepSelectionFontSize(-1);
  });
  ctxFontInc && ctxFontInc.addEventListener('mousedown', e => {
    e.preventDefault();
    stepSelectionFontSize(1);
  });
  ctxBlock && ctxBlock.addEventListener('change', () => {
    restoreSelection();
    const block = ctxBlock.value;
    if (block === 'blockquote') insertBlockquote();
    else document.execCommand('formatBlock', false, `<${block}>`);
    editor.focus();
    markDirty();
    updateFloatingContextToolbar();
  });

  contextToolbar.addEventListener('mousedown', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    e.preventDefault();
    if (btn === ctxMoreToggle) {
      const expanded = contextToolbar.classList.toggle('expanded');
      ctxMoreToggle.setAttribute('aria-expanded', String(expanded));
      ctxMoreToggle.textContent = expanded ? '-' : '+';
      updateFloatingContextToolbar();
      return;
    }

    const cmd = btn.dataset.command;
    if (cmd) {
      restoreSelection();
      if (cmd === 'formatBlockquote') insertBlockquote();
      else document.execCommand(cmd, false, null);
      editor.focus();
      markDirty();
      updateToolbarButtonActiveStates();
      updateFloatingContextToolbar();
      return;
    }

    const table = activeContextTable();
    if (btn.dataset.tableAct && table) {
      const act = btn.dataset.tableAct;
      if      (act === 'add-row') addTableRow(table);
      else if (act === 'add-col') addTableColumn(table);
      else if (act === 'del-row') removeLastTableRow(table);
      else if (act === 'del-col') removeLastTableColumn(table);
      markDirty();
      updateStats();
      updateFloatingContextToolbar();
      return;
    }

    const codeWrap = activeContextCodeBlock();
    if (btn.dataset.codeAct && codeWrap) {
      const code = codeWrap.querySelector('code');
      if (btn.dataset.codeAct === 'copy') performCopyCode(code, btn);
      if (btn.dataset.codeAct === 'collapse') {
        codeWrap.classList.toggle('is-collapsed');
        btn.textContent = codeWrap.classList.contains('is-collapsed') ? 'Expand' : 'Collapse';
      }
      if (btn.dataset.codeAct === 'lines') codeWrap.classList.toggle('hide-line-nums');
      markDirty();
      return;
    }

    const fig = activeContextFigure();
    if (btn.dataset.imageAct && fig) {
      if (btn.dataset.imageAct === 'caption') {
        const caption = fig.querySelector('.frank-img-caption');
        if (caption) caption.focus();
      }
      if (btn.dataset.imageAct === 'remove') {
        fig.remove();
        markDirty();
        updateStats();
        updateFloatingContextToolbar();
      }
    }
  });

  document.addEventListener('mousedown', e => {
    if (!contextToolbar.contains(e.target) && !editor.contains(e.target)) hideContextToolbar();
  });
}

function applyFontToSelection(key) {
  restoreSelection();
  const stack = FONT_STACKS[key] || FONT_STACKS.serif;
  const sel = window.getSelection();
  const hasSel = sel && sel.rangeCount && !sel.isCollapsed && editor.contains(sel.anchorNode);
  state.settings.editorFont = key;
  persistSettings();
  if (hasSel) {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('fontName', false, stack);
    document.execCommand('styleWithCSS', false, false);
  }
  applySettings();
  markDirty();
  saveSelection();
}

function stepSelectionFontSize(delta) {
  restoreSelection();
  const sel = window.getSelection();
  const hasSel = sel && sel.rangeCount && !sel.isCollapsed && editor.contains(sel.anchorNode);
  const current = selectionFontSizeValue();
  const next = Math.min(72, Math.max(10, current + delta));
  if (hasSel) wrapSelectionWithStyle({ fontSize: `${next}px` });
  state.settings.fontSize = next;
  persistSettings();
  applySettings();
  markDirty();
  saveSelection();
  editor.focus();
}

function selectionFontSizeValue() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    const node = sel.getRangeAt(0).startContainer;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    if (el && editor.contains(el)) {
      const px = parseFloat(getComputedStyle(el).fontSize);
      if (px > 0) return Math.round(px);
    }
  }
  return state.settings.fontSize || 18;
}

function wrapSelectionWithStyle(styles) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  Object.assign(span.style, styles);
  try {
    range.surroundContents(span);
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(nextRange);
  } catch (_) {
    document.execCommand('fontSize', false, '4');
    const font = selectionElement(sel)?.closest?.('font[size="4"]');
    if (font) {
      Object.assign(font.style, styles);
      font.removeAttribute('size');
    }
  }
}

function updateFloatingContextToolbar() {
  if (!contextToolbar) return;
  const sel = window.getSelection();
  const target = sel && sel.rangeCount ? selectionElement(sel) : document.activeElement;
  const code = target && target.closest ? target.closest('.code-block-wrapper') : null;
  if (code) {
    hideContextToolbar();
    return;
  }
  const table = target && target.closest ? target.closest('.frank-table') : null;
  const fig = target && target.closest ? target.closest('.frank-figure') : null;
  const hasText = sel && !sel.isCollapsed && editor.contains(sel.anchorNode);
  const modes = [];
  if (hasText) modes.push('text');
  if (table) modes.push('table');
  if (fig) modes.push('image');

  if (!modes.length) {
    hideContextToolbar();
    return;
  }

  contextToolbar.dataset.mode = modes.join(' ');
  contextToolbar.classList.add('visible');
  contextToolbar.setAttribute('aria-hidden', 'false');

  const rect = contextTargetRect(sel, target);
  if (!rect) return;
  const top = Math.max(76, rect.top - 48);
  const left = Math.min(window.innerWidth - 24, Math.max(24, rect.left + rect.width / 2));
  contextToolbar.style.left = `${left}px`;
  contextToolbar.style.top = `${top}px`;
}

function hideContextToolbar() {
  if (!contextToolbar) return;
  contextToolbar.classList.remove('visible');
  contextToolbar.classList.remove('expanded');
  if (ctxMoreToggle) {
    ctxMoreToggle.setAttribute('aria-expanded', 'false');
    ctxMoreToggle.textContent = '+';
  }
  contextToolbar.setAttribute('aria-hidden', 'true');
}

function selectionElement(sel) {
  const node = sel.anchorNode;
  return node && node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
}

function contextTargetRect(sel, target) {
  if (sel && sel.rangeCount && !sel.isCollapsed) {
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (rect && rect.width >= 0) return rect;
  }
  if (target && target.getBoundingClientRect) return target.getBoundingClientRect();
  return null;
}

function activeContextTable() {
  const el = selectionElement(window.getSelection());
  return el && el.closest ? el.closest('.frank-table') : null;
}

function activeContextCodeBlock() {
  const el = selectionElement(window.getSelection()) || document.activeElement;
  return el && el.closest ? el.closest('.code-block-wrapper') : null;
}

function activeContextFigure() {
  const el = selectionElement(window.getSelection()) || document.activeElement;
  return el && el.closest ? el.closest('.frank-figure') : null;
}

let editingEmbedBlock = null;

function setupEmbedModal() {
  if (!embedModal || !embedCodeInput || !embedInsertBtn) return;
  embedModal.addEventListener('click', e => {
    if (e.target === embedModal) closeEmbedDialog();
  });
  embedCloseBtn && embedCloseBtn.addEventListener('click', closeEmbedDialog);
  embedCancelBtn && embedCancelBtn.addEventListener('click', closeEmbedDialog);
  embedInsertBtn.addEventListener('click', commitEmbedDialog);
  embedCodeInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeEmbedDialog();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      commitEmbedDialog();
    }
  });
}

function openEmbedDialog(block = null) {
  if (!embedModal || !embedCodeInput) return;
  saveSelection();
  editingEmbedBlock = block;
  embedCodeInput.value = block ? (block.dataset.embedCode || '') : '';
  embedModal.classList.add('active');
  setTimeout(() => {
    embedCodeInput.focus();
    if (!block) embedCodeInput.select();
  }, 20);
}

function closeEmbedDialog() {
  if (!embedModal) return;
  embedModal.classList.remove('active');
  editingEmbedBlock = null;
  editor.focus();
}

function commitEmbedDialog() {
  const raw = normalizeEmbedCode((embedCodeInput && embedCodeInput.value || '').trim());
  if (!raw) return;
  if (editingEmbedBlock) {
    updateEmbedBlock(editingEmbedBlock, raw);
  } else {
    restoreSelection();
    insertEmbedBlock(raw);
  }
  closeEmbedDialog();
}

function normalizeEmbedCode(raw) {
  const code = String(raw || '').trim();
  if (!code) return '';
  if (/^https?:\/\//i.test(code) && !/[<>\s]/.test(code)) {
    return `<iframe src="${escapeHTML(normalizeEmbedURL(code) || code)}" loading="lazy" allowfullscreen></iframe>`;
  }
  return code;
}

function normalizeEmbedURL(rawURL) {
  const raw = String(rawURL || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    let videoId = '';
    if (host === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname.startsWith('/embed/')) videoId = url.pathname.split('/')[2] || '';
      else if (url.pathname.startsWith('/shorts/')) videoId = url.pathname.split('/')[2] || '';
      else videoId = url.searchParams.get('v') || '';
    }
    if (videoId) {
      const embed = new URL(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`);
      const start = url.searchParams.get('start') || url.searchParams.get('t');
      if (start) embed.searchParams.set('start', String(start).replace(/[^\d]/g, ''));
      return embed.toString();
    }
  } catch (_) {}
  return raw;
}

function youtubeEmbedInfo(raw) {
  const src = directEmbedURL(raw);
  if (!src) return null;
  try {
    const url = new URL(src);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null;
    const videoId = url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] : '';
    if (!videoId) return null;
    return {
      videoId,
      watchURL: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      thumbnailURL: `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`
    };
  } catch (_) {
    return null;
  }
}

function directEmbedURL(raw) {
  const code = String(raw || '').trim();
  if (!code) return '';
  const iframeSrc = code.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const candidate = iframeSrc ? iframeSrc[1] : (/^https?:\/\//i.test(code) && !/[<>\s]/.test(code) ? code : '');
  return candidate ? normalizeEmbedURL(candidate) : '';
}

function embedSrcDoc(raw) {
  const code = String(raw || '');
  return `<!doctype html><html><head><base target="_blank"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;min-height:100%;background:transparent;color:inherit;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}body{display:grid;place-items:stretch;padding:0;box-sizing:border-box;}iframe{width:100%;min-height:300px;border:0;}video,img,object,embed{max-width:100%;}script{display:none}</style></head><body>${code}</body></html>`;
}

function updateEmbedBlock(block, raw, options = {}) {
  if (!block) return;
  block.dataset.embedCode = raw;
  const preview = block.querySelector('.frank-embed-preview');
  let iframe = block.querySelector('.frank-embed-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.className = 'frank-embed-frame';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-presentation';
    preview?.appendChild(iframe);
  }
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  const directURL = directEmbedURL(raw);
  if (directURL) {
    iframe.removeAttribute('srcdoc');
    iframe.src = directURL;
  } else {
    iframe.removeAttribute('src');
    iframe.srcdoc = embedSrcDoc(raw);
  }
  if (!options.silent) {
    markDirty();
    syncActiveProjectFile();
  }
}

function insertEmbedBlock(raw) {
  const block = document.createElement('div');
  block.className = 'frank-embed-block';
  block.contentEditable = 'false';
  block.dataset.embedCode = raw;
  block.innerHTML = `
    <div class="frank-embed-toolbar">
      <span>Embed</span>
      <div>
        <button type="button" class="frank-embed-btn" data-embed-action="edit">Edit</button>
        <button type="button" class="frank-embed-btn danger" data-embed-action="delete">Delete</button>
      </div>
    </div>
    <div class="frank-embed-preview">
      <iframe class="frank-embed-frame" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>`;
  updateEmbedBlock(block, raw, { silent: true });

  const range = currentInsertRange();
  if (range) {
    range.deleteContents();
    range.insertNode(block);
    const after = document.createElement('p');
    after.innerHTML = '<br>';
    block.after(after);
    placeCaretAtEnd(after);
  } else {
    editor.appendChild(block);
    const after = document.createElement('p');
    after.innerHTML = '<br>';
    editor.appendChild(after);
    placeCaretAtEnd(after);
  }
  bindEmbedBlocks();
  markDirty();
  syncActiveProjectFile();
  updateStats();
  updatePageGuides();
}

function currentInsertRange() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  return editor.contains(range.commonAncestorContainer) ? range : null;
}

function bindEmbedBlocks() {
  if (!editor) return;
  editor.querySelectorAll('.frank-embed-block').forEach(block => {
    const raw = block.dataset.embedCode || '';
    if (!block.querySelector('.frank-embed-toolbar')) {
      const toolbar = document.createElement('div');
      toolbar.className = 'frank-embed-toolbar';
      toolbar.innerHTML = '<span>Embed</span><div><button type="button" class="frank-embed-btn" data-embed-action="edit">Edit</button><button type="button" class="frank-embed-btn danger" data-embed-action="delete">Delete</button></div>';
      block.prepend(toolbar);
    }
    if (!block.querySelector('.frank-embed-preview')) {
      const preview = document.createElement('div');
      preview.className = 'frank-embed-preview';
      block.appendChild(preview);
    }
    if (!block.querySelector('.frank-embed-resize-handle')) {
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'frank-embed-resize-handle';
      handle.title = 'Drag to resize';
      handle.setAttribute('aria-label', 'Resize embed');
      handle.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="12" x2="12" y2="4"></line><polyline points="12,4 12,9"></polyline><polyline points="7,4 12,4"></polyline></svg>';
      block.appendChild(handle);
    }
    updateEmbedBlock(block, raw, { silent: true });
    setupEmbedResize(block);
    _setupFreeBlockDrag(block, { ignore: '.frank-embed-btn, .frank-embed-resize-handle, .frank-embed-frame, .frank-embed-preview iframe, a' });
    if (block.dataset.embedBound) return;
    block.dataset.embedBound = '1';
    block.addEventListener('click', e => {
      const action = e.target.closest('[data-embed-action]');
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      if (action.dataset.embedAction === 'edit') openEmbedDialog(block);
      if (action.dataset.embedAction === 'delete') {
        const replacement = document.createElement('p');
        replacement.innerHTML = '<br>';
        block.replaceWith(replacement);
        placeCaretAtEnd(replacement);
        markDirty();
        syncActiveProjectFile();
        updateStats();
        updatePageGuides();
      }
    });
  });
}

function setupEmbedResize(block) {
  const handle = block && block.querySelector('.frank-embed-resize-handle');
  if (!block || !handle || handle.dataset.resBound) return;
  handle.dataset.resBound = '1';
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = block.offsetWidth;
    const startH = block.offsetHeight;
    const frame = block.querySelector('.frank-embed-frame');
    const preview = block.querySelector('.frank-embed-preview');
    const startFrameH = frame ? frame.offsetHeight : preview ? preview.offsetHeight : startH;
    let pendingW = startW;
    let pendingFrameH = startFrameH;
    let resizeFrame = null;
    block.classList.add('resizing');
    document.body.classList.add('is-resizing-widget');

    const paintSize = () => {
      resizeFrame = null;
      block.style.width = `${pendingW}px`;
      if (frame) {
        frame.style.minHeight = `${pendingFrameH}px`;
        frame.style.height = `${pendingFrameH}px`;
      }
      if (preview) preview.style.minHeight = `${pendingFrameH}px`;
    };

    const onMove = ev => {
      pendingW = Math.max(220, Math.min(editor.offsetWidth - 24, startW + ev.clientX - startX));
      pendingFrameH = Math.max(160, Math.min(900, startFrameH + ev.clientY - startY));
      if (!resizeFrame) resizeFrame = requestAnimationFrame(paintSize);
    };
    const onUp = () => {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = null;
      }
      paintSize();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      block.classList.remove('resizing');
      document.body.classList.remove('is-resizing-widget');
      markDirty();
      syncActiveProjectFile();
      updatePageGuides();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

const COMMANDS = [
  { id: 'code', title: '/code', desc: 'Open the code and snippet palette', key: '⌘J' },
  { id: 'table', title: '/table', desc: 'Add a clean 3 × 3 editable table', key: 'table' },
  { id: 'math', title: '/math', desc: 'Insert a live LaTeX-style equation', key: 'math' },
  { id: 'callout', title: '/callout', desc: 'Insert a note, warning, or tip callout', key: 'callout' },
  { id: 'task', title: '/task', desc: 'Insert an empty checkbox', key: 'task' },
  { id: 'link', title: '/link', desc: 'Link selected text to a project page', key: '⌘K' },
  { id: 'image', title: '/image', desc: 'Place an image on the document canvas', key: 'image' },
  { id: 'embed', title: '/embed', desc: 'Paste and preview embed code', key: 'embed' },
  { id: 'find', title: 'Find', desc: 'Search this document', key: '⌘F' },
  { id: 'global-search', title: 'Global search', desc: 'Search all workspaces', key: '⇧⌘F' },
  { id: 'focus', title: 'Focus mode', desc: 'Hide chrome and write calmly', key: 'focus' },
  { id: 'versions', title: 'Version history', desc: 'Restore one of the last 20 snapshots', key: 'history' },
  { id: 'present', title: 'Presentation mode', desc: 'Export this document as slides', key: 'slides' },
  { id: 'publish', title: 'Publish URL', desc: 'Create a localhost preview URL', key: 'URL' },
  { id: 'workspace', title: 'New workspace', desc: 'Create a fresh workspace with one file', key: 'workspace' },
  { id: 'theme', title: 'Change theme', desc: 'Toggle Light and Dark Mode', key: 'theme' },
  { id: 'pdf', title: 'Export PDF', desc: 'Export a polished PDF', key: 'PDF' },
  { id: 'md', title: 'Export Markdown', desc: 'Export clean Markdown', key: 'MD' }
];

const BASE_SLASH_COMMANDS = [
  { id: 'table', title: '/table', desc: 'Editable table', icon: '▦' },
  { id: 'math', title: '/math', desc: 'Live equation preview', icon: '∑' },
  { id: 'callout', title: '/callout', desc: 'Note, warning, or tip', icon: '!' },
  { id: 'task', title: '/task', desc: 'Empty checkbox', icon: '✓' },
  {
    id: 'image',
    title: '/image',
    desc: 'Add photo or screenshot',
    icon: '□',
    submenu: [
      { id: 'file', title: 'Choose Photo', desc: 'Select from your Mac' },
      { id: 'screenshot', title: 'Screenshot', desc: 'Capture from screen' }
    ]
  },
  { id: 'embed', title: '/embed', desc: 'Embed code', icon: '<>' },
  { id: 'publish', title: '/publish', desc: 'Local preview URL', icon: '↗' }
];

function slashCommands() {
  return BASE_SLASH_COMMANDS;
}

function setupCommandPalette() {
  if (!commandModal || !commandSearch || !commandResults) return;
  commandSearch.addEventListener('input', renderCommandResults);
  commandModal.addEventListener('click', e => { if (e.target === commandModal) closeCommandPalette(); });
  commandModal.addEventListener('keydown', e => {
    const items = [...commandResults.querySelectorAll('.command-item')];
    const current = items.findIndex(el => el.classList.contains('selected'));
    if (e.key === 'Escape') { e.preventDefault(); closeCommandPalette(); }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectCommandIndex(Math.min(items.length - 1, current + 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectCommandIndex(Math.max(0, current - 1));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = commandResults.querySelector('.command-item.selected') || items[0];
      if (selected) runCommand(selected.dataset.commandId);
    }
  });
  renderCommandResults();
}

function openCommandPalette(seed = '') {
  saveSelection();
  commandModal.classList.add('active');
  commandSearch.value = seed;
  renderCommandResults();
  setTimeout(() => commandSearch.focus(), 20);
}

function closeCommandPalette() {
  commandModal.classList.remove('active');
  editor.focus();
}

function renderCommandResults() {
  const q = (commandSearch.value || '').toLowerCase().trim();
  const filtered = COMMANDS.filter(c => !q || `${c.title} ${c.desc} ${c.key}`.toLowerCase().includes(q));
  commandResults.innerHTML = filtered.map((c, idx) => (
    `<button class="command-item${idx === 0 ? ' selected' : ''}" data-command-id="${c.id}">` +
    `<span><span class="command-title">${escapeHTML(c.title)}</span>` +
    `<span class="command-desc">${escapeHTML(c.desc)}</span></span>` +
    `<span class="command-key">${escapeHTML(c.key)}</span></button>`
  )).join('');
  commandResults.querySelectorAll('.command-item').forEach((btn, idx) => {
    btn.addEventListener('mouseenter', () => selectCommandIndex(idx));
    btn.addEventListener('mousedown', e => { e.preventDefault(); runCommand(btn.dataset.commandId); });
  });
}

function selectCommandIndex(index) {
  const items = [...commandResults.querySelectorAll('.command-item')];
  items.forEach((el, idx) => el.classList.toggle('selected', idx === index));
  if (items[index]) items[index].scrollIntoView({ block: 'nearest' });
}

function runCommand(id) {
  closeCommandPalette();
  restoreSelection();
  executeBlockCommand(id);
}

function executeBlockCommand(id) {
  if (id === 'math') insertMathBlock();
  if (id === 'mermaid') insertMermaidBlock();
  if (id === 'callout') insertCalloutBlock('NOTE');
  if (id === 'task') insertTaskList();
  if (id === 'link') insertPageLinkFromSelection();
  if (id === 'table') insertTable(3, 3);
  if (id === 'image') openImageFilePicker();
  if (id === 'embed') openEmbedDialog();
  if (id === 'quote') insertBlockquote();
  if (id === 'find') openSearch();
  if (id === 'global-search') openGlobalSearch();
  if (id === 'focus') toggleFocusMode(true);
  if (id === 'versions') openVersionHistory();
  if (id === 'present') exportPresentation();
  if (id === 'publish') publishToDataURL();
  if (id === 'workspace') workspace();
  if (id === 'theme') toggleDarkMode();
  if (id === 'pdf') exportToPDF();
  if (id === 'md') exportToMarkdown();
}

function setupSlashPopover() {
  if (!slashPopover || !slashResults) return;
  document.addEventListener('mousedown', e => {
    if (!slashPopover.contains(e.target) && !editor.contains(e.target)) closeSlashPopover();
  });
}

function openSlashPopover() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0).cloneRange();
  const slashNode = document.createTextNode('/');
  range.insertNode(slashNode);
  range.setStartAfter(slashNode);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
  slashState = { mode: 'slash', query: '', activeIndex: 0 };
  saveSelection();
  positionSlashPopover();
  renderSlashResults();
  slashPopover.classList.add('visible');
  slashPopover.setAttribute('aria-hidden', 'false');
  markDirty();
  updateStats();
}

function closeSlashPopover() {
  if (!slashPopover) return;
  slashState = null;
  delete slashPopover.dataset.mode;
  slashPopover.classList.remove('visible');
  slashPopover.setAttribute('aria-hidden', 'true');
}

function handleSlashKeydown(e) {
  if (!slashState) return false;
  if (e.key === 'Escape') {
    e.preventDefault();
    if (slashState.mode === 'snippet') removeSnippetTrigger();
    else removeSlashQuery();
    closeSlashPopover();
    return true;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    slashState.activeIndex = Math.min(currentInlineCommands().length - 1, slashState.activeIndex + 1);
    renderSlashResults();
    return true;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    slashState.activeIndex = Math.max(0, slashState.activeIndex - 1);
    renderSlashResults();
    return true;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    chooseSlashCommand();
    return true;
  }
  if (e.key === 'Backspace') {
    requestAnimationFrame(updateActiveInlineCommandFromCaret);
    return false;
  }
  if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
    requestAnimationFrame(updateActiveInlineCommandFromCaret);
    return false;
  }
  return false;
}

function updateSlashQueryFromCaret() {
  if (!slashState) return;
  const query = currentSlashQuery();
  if (query == null) {
    closeSlashPopover();
    return;
  }
  slashState.query = query;
  slashState.activeIndex = Math.min(slashState.activeIndex, Math.max(0, filteredSlashCommands().length - 1));
  positionSlashPopover();
  renderSlashResults();
}

function updateActiveInlineCommandFromCaret() {
  if (!slashState) return;
  if (slashState.mode === 'snippet') updateSnippetTriggerFromCaret();
  else updateSlashQueryFromCaret();
}

function currentSlashQuery() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !sel.isCollapsed || !editor.contains(sel.anchorNode)) return null;
  const range = sel.getRangeAt(0).cloneRange();
  range.setStart(editor, 0);
  const before = range.toString();
  const match = before.match(/\/([a-z0-9-]*)$/i);
  return match ? match[1] : null;
}

function currentSnippetTriggerQuery() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !sel.isCollapsed || !editor.contains(sel.anchorNode)) return null;
  const target = selectionElement(sel);
  if (target && target.closest && target.closest('.code-block-wrapper')) return null;
  const range = sel.getRangeAt(0).cloneRange();
  range.setStart(editor, 0);
  const before = range.toString();
  const match = before.match(/\{\{([a-z0-9+#._-]*)$/i);
  return match ? match[1] : null;
}

function updateSnippetTriggerFromCaret() {
  const query = currentSnippetTriggerQuery();
  if (query == null) {
    if (slashState && slashState.mode === 'snippet') closeSlashPopover();
    return;
  }
  slashState = {
    mode: 'snippet',
    query,
    activeIndex: Math.min(slashState && slashState.mode === 'snippet' ? slashState.activeIndex : 0, Math.max(0, filteredSnippetTriggerCommands(query).length - 1))
  };
  positionSlashPopover();
  renderSlashResults();
  slashPopover.dataset.mode = 'snippet';
  slashPopover.classList.add('visible');
  slashPopover.setAttribute('aria-hidden', 'false');
}

function snippetTriggerCommands() {
  return snippetCatalog.map((snippet, index) => ({
    id: `snippet-trigger-${index}`,
    snippetIndex: index,
    title: snippet.name,
    desc: `${snippet.lang} · ${snippet.desc}`,
    icon: snippet.lang.slice(0, 2).toUpperCase()
  }));
}

function filteredSnippetTriggerCommands(rawQuery = null) {
  const q = String(rawQuery ?? (slashState && slashState.query) ?? '').toLowerCase();
  return snippetTriggerCommands().filter(cmd => {
    const snippet = snippetCatalog[cmd.snippetIndex];
    const hay = `${snippet.name} ${snippet.lang} ${snippet.desc} ${snippet.tags.join(' ')}`.toLowerCase();
    return !q || hay.includes(q);
  });
}

function removeSnippetTrigger() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const query = currentSnippetTriggerQuery();
  if (query == null) return;
  const caretRange = sel.getRangeAt(0).cloneRange();
  const beforeRange = caretRange.cloneRange();
  beforeRange.selectNodeContents(editor);
  beforeRange.setEnd(caretRange.endContainer, caretRange.endOffset);
  const caretOffset = beforeRange.toString().length;
  const fullText = editor.textContent || '';
  const startOffset = Math.max(0, caretOffset - query.length - 2);
  const endOffset = fullText.slice(caretOffset, caretOffset + 2) === '}}'
    ? caretOffset + 2
    : caretOffset;
  const removeRange = rangeFromEditorTextOffsets(startOffset, endOffset);
  if (!removeRange) return;
  removeRange.deleteContents();
  removeRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(removeRange);
  saveSelection();
}

function rangeFromEditorTextOffsets(startOffset, endOffset) {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let offset = 0;
  let node;
  let didStart = false;
  while ((node = walker.nextNode())) {
    const nextOffset = offset + node.textContent.length;
    if (!didStart && startOffset <= nextOffset) {
      range.setStart(node, Math.max(0, startOffset - offset));
      didStart = true;
    }
    if (didStart && endOffset <= nextOffset) {
      range.setEnd(node, Math.max(0, endOffset - offset));
      return range;
    }
    offset = nextOffset;
  }
  if (didStart) {
    range.setEnd(editor, editor.childNodes.length);
    return range;
  }
  return null;
}

function injectSnippetByIndex(index) {
  const snippet = snippetCatalog[index];
  if (!snippet) return;
  state.filteredSnippets = [snippet];
  state.activeSnippetIndex = 0;
  state.snippetTargetCodeEl = null;
  injectSelectedSnippet();
}

function filteredSlashCommands() {
  const q = (slashState && slashState.query || '').toLowerCase();
  return slashCommands().filter(cmd => {
    const hay = `${cmd.title} ${cmd.desc} ${cmd.id} ${cmd.lang || ''}`.toLowerCase().replace(/[\/{}]/g, '');
    return !q || hay.includes(q);
  });
}

function currentInlineCommands() {
  return slashState && slashState.mode === 'snippet'
    ? filteredSnippetTriggerCommands()
    : filteredSlashCommands();
}

function renderSlashResults() {
  const items = currentInlineCommands();
  const mode = slashState && slashState.mode || 'slash';
  slashPopover.dataset.mode = mode;
  const header = mode === 'snippet'
    ? `<div class="slash-header"><span>Snippet palette</span><strong>${escapeHTML(slashState.query || 'type language')}</strong></div>`
    : '';
  slashResults.innerHTML = header + (items.length ? items.map((cmd, idx) => (
    `<button class="slash-item${idx === slashState.activeIndex ? ' selected' : ''}${cmd.submenu ? ' has-submenu' : ''}" data-command-id="${cmd.id}">` +
    `<span class="slash-icon">${escapeHTML(cmd.icon)}</span>` +
    `<span><span class="slash-title">${escapeHTML(cmd.title)}</span>` +
    `<span class="slash-desc">${escapeHTML(cmd.desc)}</span></span>` +
    `<span class="slash-key">${cmd.submenu ? '›' : cmd.snippetIndex != null ? 'Enter' : ''}</span>` +
    (cmd.submenu ? `<span class="slash-submenu" aria-label="${escapeHTML(cmd.title)} options">` +
      cmd.submenu.map(item => (
        `<span class="slash-subitem" role="button" tabindex="-1" data-command-id="${cmd.id}" data-sub-command="${item.id}">` +
        `<strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.desc)}</small></span>`
      )).join('') + `</span>` : '') +
    `</button>`
  )).join('') : '<div class="slash-empty">No matches</div>');
  slashResults.querySelectorAll('.slash-item').forEach((btn, idx) => {
    btn.addEventListener('mouseenter', () => { slashState.activeIndex = idx; renderSlashResults(); });
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      const sub = e.target.closest('[data-sub-command]');
      if (sub) chooseSlashSubCommand(sub.dataset.commandId, sub.dataset.subCommand);
      else chooseSlashCommand(btn.dataset.commandId);
    });
  });
}

function chooseSlashSubCommand(commandId, subCommandId) {
  if (commandId === 'image') {
    removeSlashQuery();
    closeSlashPopover();
    if (subCommandId === 'screenshot') captureScreenshotToImage();
    else openImageFilePicker();
  }
}

function chooseSlashCommand(forcedId = null) {
  const items = currentInlineCommands();
  const all = slashState && slashState.mode === 'snippet' ? snippetTriggerCommands() : slashCommands();
  const cmd = forcedId ? all.find(c => c.id === forcedId) : items[slashState.activeIndex];
  if (!cmd) return;
  if (slashState.mode === 'snippet') {
    const index = cmd.snippetIndex;
    removeSnippetTrigger();
    closeSlashPopover();
    injectSnippetByIndex(index);
    return;
  }
  removeSlashQuery();
  closeSlashPopover();
  executeBlockCommand(cmd.id);
}

function removeSlashQuery() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const query = currentSlashQuery();
  if (query == null) return;
  const range = sel.getRangeAt(0);
  const start = range.cloneRange();
  try {
    start.setStart(range.startContainer, Math.max(0, range.startOffset - query.length - 1));
    start.deleteContents();
  } catch (_) {}
  saveSelection();
}

function positionSlashPopover() {
  if (!slashPopover) return;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0).cloneRange();
  let rect = range.getBoundingClientRect();
  if (!rect || (!rect.width && !rect.height)) {
    const marker = document.createElement('span');
    marker.textContent = '\u200b';
    range.insertNode(marker);
    rect = marker.getBoundingClientRect();
    marker.remove();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  const popoverWidth = 292;
  const popoverMaxHeight = Math.min(360, Math.max(210, window.innerHeight - 32));
  const spaceBelow = window.innerHeight - rect.bottom - 14;
  const openAbove = spaceBelow < 230 && rect.top > spaceBelow;
  const x = Math.min(window.innerWidth - popoverWidth - 16, Math.max(16, rect.left));
  const y = openAbove
    ? Math.max(16, rect.top - popoverMaxHeight - 10)
    : Math.min(window.innerHeight - popoverMaxHeight - 16, Math.max(16, rect.bottom + 10));
  slashPopover.style.maxHeight = `${popoverMaxHeight}px`;
  slashPopover.style.left = `${x}px`;
  slashPopover.style.top = `${y}px`;
}

function insertEmptyCodeBlock(lang = 'text') {
  state.filteredSnippets = [{ lang, name: 'Blank code block', desc: '', code: '' }];
  state.activeSnippetIndex = 0;
  injectSelectedSnippet();
}

function openImageFilePicker() {
  if (window.webkit?.messageHandlers?.mediaHandler) {
    window.webkit.messageHandlers.mediaHandler.postMessage({ action: 'choosePhoto' });
    return;
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  input.style.top = '0';
  input.style.opacity = '0';
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) {
      input.remove();
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      restoreSelection();
      insertImage(ev.target.result);
      input.remove();
    };
    reader.onerror = () => input.remove();
    reader.readAsDataURL(file);
  });
  input.addEventListener('cancel', () => input.remove());
  document.body.appendChild(input);
  input.click();
}

async function captureScreenshotToImage() {
  if (window.webkit?.messageHandlers?.mediaHandler) {
    window.webkit.messageHandlers.mediaHandler.postMessage({ action: 'screenshot' });
    return;
  }
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
    window.alert('Screen capture is not available in this app window. Use Choose Photo to import a saved screenshot.');
    return;
  }
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' },
      audio: false
    });
    const video = document.createElement('video');
    video.muted = true;
    video.srcObject = stream;
    await video.play();
    await new Promise(resolve => {
      if (video.videoWidth && video.videoHeight) resolve();
      else video.addEventListener('loadedmetadata', resolve, { once: true });
    });
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    restoreSelection();
    insertImage(dataURL);
  } catch (err) {
    if (err && err.name !== 'NotAllowedError') {
      window.alert('Screen capture could not be started. You can still use Choose Photo to import a saved screenshot.');
    }
  } finally {
    if (stream) stream.getTracks().forEach(track => track.stop());
  }
}

window.frankNativeDidSelectImage = function frankNativeDidSelectImage(payload) {
  if (!payload || !payload.dataURL) return;
  restoreSelection();
  insertImage(payload.dataURL);
};

function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme') || state.settings.theme || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  state.settings.followSystemTheme = false;
  state.settings.theme = next;
  state.activeTheme = next;
  persistSettings();
  applySettings();
}

function systemTheme() {
  if (state.settings.followSystemTheme && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return state.settings.theme || state.activeTheme || 'light';
}

function updateThemeToggleIcon() {
  if (!themeToggleBtn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  themeToggleBtn.classList.toggle('active', isDark);
  themeToggleBtn.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';
  themeToggleBtn.setAttribute('aria-label', themeToggleBtn.title);
  themeToggleBtn.innerHTML = isDark
    ? '<svg style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2.5" viewBox="0 0 24 24"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z"></path></svg>'
    : '<svg style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
}

function setupZoomDock() {
  if (!zoomDock || !zoomSlider || !zoomReset || !editor) return;

  const zoomSurface = document.querySelector('.editor-workspace') || editor;
  const saved = Number(localStorage.getItem('frank:canvasZoom') || 100);
  let dragGeometry = null;
  let dragOffset = 0;
  let pinchStartZoom = 100;
  let lastGestureAt = 0;

  const zoomRange = () => ({
    min: Number(zoomSlider.min) || 50,
    max: Number(zoomSlider.max) || 150,
    step: Number(zoomSlider.step) || 5
  });

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const snapZoom = value => {
    const { min, max, step } = zoomRange();
    const clamped = clamp(Number(value) || 100, min, max);
    return clamp(Math.round(clamped / step) * step, min, max);
  };

  const progressForZoom = zoom => {
    const { min, max } = zoomRange();
    return max === min ? 0 : clamp((zoom - min) / (max - min), 0, 1);
  };

  const railGeometry = () => {
    const railRect = zoomSlider.getBoundingClientRect();
    const wellRect = zoomReset.getBoundingClientRect();
    const { min, max, step } = zoomRange();
    const wellWidth = Math.max(1, wellRect.width || 38);
    const travel = Math.max(0, railRect.width - wellWidth);
    return { min, max, step, railLeft: railRect.left, railWidth: railRect.width, wellWidth, travel };
  };

  const wellXForZoom = (zoom, geometry = railGeometry()) => progressForZoom(zoom) * geometry.travel;

  const zoomForPointer = (clientX, geometry, offset = 0) => {
    const x = clamp(clientX - offset - geometry.railLeft, 0, geometry.travel);
    const progress = geometry.travel <= 0 ? 0 : x / geometry.travel;
    return geometry.min + progress * (geometry.max - geometry.min);
  };

  const beginRailDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    dragGeometry = railGeometry();
    zoomDock.classList.add('zoom-dragging');
    zoomSlider.setPointerCapture && zoomSlider.setPointerCapture(e.pointerId);

    const currentZoom = snapZoom(zoomSlider.value);
    const currentWellX = wellXForZoom(currentZoom, dragGeometry);
    const currentWellCenter = dragGeometry.railLeft + currentWellX + dragGeometry.wellWidth / 2;
    const pointerOffset = e.clientX - currentWellCenter;
    dragOffset = Math.abs(pointerOffset) <= dragGeometry.wellWidth / 2 ? pointerOffset : 0;
    applyCanvasZoom(zoomForPointer(e.clientX, dragGeometry, dragOffset));
  };

  const moveRailDrag = e => {
    if (!dragGeometry) return;
    e.preventDefault();
    applyCanvasZoom(zoomForPointer(e.clientX, dragGeometry, dragOffset));
  };

  const endRailDrag = e => {
    if (!dragGeometry) return;
    dragGeometry = null;
    dragOffset = 0;
    zoomSlider.releasePointerCapture && zoomSlider.releasePointerCapture(e.pointerId);
    zoomDock.classList.remove('zoom-dragging');
    applyCanvasZoom(Number(zoomSlider.value) || 100);
  };

  zoomSlider.addEventListener('pointerdown', beginRailDrag);
  zoomSlider.addEventListener('pointermove', moveRailDrag);
  zoomSlider.addEventListener('pointerup', endRailDrag);
  zoomSlider.addEventListener('pointercancel', endRailDrag);
  zoomSlider.addEventListener('input', () => applyCanvasZoom(Number(zoomSlider.value)));
  zoomSlider.addEventListener('change', () => applyCanvasZoom(Number(zoomSlider.value)));

  zoomDock.addEventListener('wheel', e => {
    e.preventDefault();
    applyCanvasZoom(Number(zoomSlider.value) + (e.deltaY > 0 ? -5 : 5));
  }, { passive: false });

  zoomSurface.addEventListener('gesturestart', e => {
    e.preventDefault();
    lastGestureAt = Date.now();
    pinchStartZoom = Number(zoomSlider.value) || 100;
  }, { passive: false });

  zoomSurface.addEventListener('gesturechange', e => {
    e.preventDefault();
    lastGestureAt = Date.now();
    applyCanvasZoom(pinchStartZoom * (Number(e.scale) || 1));
  }, { passive: false });

  zoomSurface.addEventListener('gestureend', e => e.preventDefault(), { passive: false });

  zoomSurface.addEventListener('wheel', e => {
    if (!e.ctrlKey || Date.now() - lastGestureAt < 80) return;
    e.preventDefault();
    applyCanvasZoom((Number(zoomSlider.value) || 100) * Math.exp(-e.deltaY * 0.01));
  }, { passive: false });

  window.addEventListener('resize', () => applyCanvasZoom(Number(zoomSlider.value) || 100));

  applyCanvasZoom(Number.isFinite(saved) ? saved : 100);

  function applyCanvasZoom(value) {
    const zoom = snapZoom(value);
    const progress = progressForZoom(zoom);
    const geometry = dragGeometry || railGeometry();
    const wellX = clamp(progress * geometry.travel, 0, geometry.travel);

    zoomSlider.value = String(zoom);
    zoomReset.textContent = String(zoom);
    zoomDock.style.setProperty('--zoom-progress', progress * 100 + '%');
    zoomDock.style.setProperty('--zoom-chip-x', wellX + 'px');

    editor.style.setProperty('zoom', String(zoom / 100));
    editor.style.transformOrigin = 'top center';
    localStorage.setItem('frank:canvasZoom', String(zoom));
    requestAnimationFrame(updatePageGuides);
  }
}

function setupTemplateChips() {
  document.querySelectorAll('.template-chips button').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      const key = btn.dataset.template;
      const title = btn.textContent.trim();
      const bodies = {
        'technical-note': '<h1>Technical note</h1><p>Context, decision, evidence.</p><h2>Notes</h2><p><br></p>',
        tutorial: '<h1>Tutorial</h1><p>What the reader will build.</p><h2>Steps</h2><ol><li>Prepare</li><li>Build</li><li>Verify</li></ol>',
        readme: '<h1>README</h1><p>What this project does and how to run it.</p><h2>Install</h2><p><br></p><h2>Usage</h2><p><br></p>',
        'api-doc': '<h1>API doc</h1><p>Endpoint summary.</p><h2>Request</h2><p><br></p><h2>Response</h2><p><br></p>',
        'meeting-notes': '<h1>Meeting notes</h1><p>Date, attendees, decisions.</p><h2>Actions</h2><ul><li><br></li></ul>'
      };
      editor.innerHTML = bodies[key] || `<h1>${escapeHTML(title)}</h1><p><br></p>`;
      documentTitle.value = title;
      markDirty();
      updateStats();
      updateWindowTitle();
      editor.focus();
    });
  });
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t]||t));
}

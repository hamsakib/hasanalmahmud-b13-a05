import { fetchAllIssues, fetchSingleIssue, searchIssues } from './api.js';
import { fillModal, getIssueStatus, renderIssues, renderSummary, setActiveTab } from './ui.js';

if (localStorage.getItem('issueTrackerAuth') !== 'true') {
  window.location.href = 'login.html';
}

const state = {
  allIssues: [],
  visibleIssues: [],
  activeTab: 'all',
};

const refs = {
  tabs: [...document.querySelectorAll('.tab-btn')],
  issuesContainer: document.getElementById('issuesContainer'),
  issueCount: document.getElementById('issueCount'),
  openCount: document.getElementById('openCount'),
  closedCount: document.getElementById('closedCount'),
  spinner: document.getElementById('spinner'),
  errorMessage: document.getElementById('errorMessage'),
  activeViewText: document.getElementById('activeViewText'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  logoutBtn: document.getElementById('logoutBtn'),

  issueModal: document.getElementById('issueModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),

  modalTitle: document.getElementById('modalTitle'),
  modalMetaLine: document.getElementById('modalMetaLine'),
  modalLabel: document.getElementById('modalLabel'),
  modalDescription: document.getElementById('modalDescription'),
  modalAuthor: document.getElementById('modalAuthor'),
  modalPriority: document.getElementById('modalPriority'),
};

function showSpinner() {
  refs.spinner.classList.remove('hidden');
}

function hideSpinner() {
  refs.spinner.classList.add('hidden');
}

function showError(message) {
  refs.errorMessage.textContent = message;
}

function clearError() {
  refs.errorMessage.textContent = '';
}

function applyTabFilter(tabName) {
  state.activeTab = tabName;

  if (tabName === 'all') {
    state.visibleIssues = [...state.allIssues];
  } else {
    state.visibleIssues = state.allIssues.filter((issue) => getIssueStatus(issue) === tabName);
  }

  renderCurrentView();
}

function renderCurrentView() {
  renderIssues(refs.issuesContainer, state.visibleIssues, openIssueDetails);
  renderSummary(state.visibleIssues, refs, state.activeTab);
  setActiveTab(refs.tabs, state.activeTab);
}

async function loadAllIssues() {
  showSpinner();
  clearError();

  try {
    const issues = await fetchAllIssues();
    state.allIssues = Array.isArray(issues) ? issues : [];
    applyTabFilter('all');
  } catch (error) {
    showError('Failed to load issues. Please try again later.');
    console.error(error);
  } finally {
    hideSpinner();
  }
}

async function openIssueDetails(issueId) {
  showSpinner();
  clearError();

  try {
    const issue = await fetchSingleIssue(issueId);
    fillModal(issue, refs);
    refs.issueModal.showModal();
  } catch (error) {
    showError('Unable to load issue details.');
    console.error(error);
  } finally {
    hideSpinner();
  }
}

async function handleSearch(event) {
  event.preventDefault();
  const query = refs.searchInput.value.trim();

  if (!query) {
    applyTabFilter(state.activeTab === 'search' ? 'all' : state.activeTab);
    return;
  }

  showSpinner();
  clearError();

  try {
    const issues = await searchIssues(query);
    state.visibleIssues = Array.isArray(issues) ? issues : [];
    state.activeTab = 'search';
    renderCurrentView();
  } catch (error) {
    showError('Search failed. Please try another keyword.');
    console.error(error);
  } finally {
    hideSpinner();
  }
}

refs.tabs.forEach((button) => {
  button.addEventListener('click', () => {
    refs.searchInput.value = '';
    applyTabFilter(button.dataset.tab);
  });
});

refs.searchForm.addEventListener('submit', handleSearch);

refs.logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('issueTrackerAuth');
  window.location.href = 'login.html';
});

refs.closeModalBtn.addEventListener('click', () => {
  refs.issueModal.close();
});

refs.issueModal.addEventListener('click', (event) => {
  const dialogDimensions = refs.issueModal.getBoundingClientRect();
  const isInDialog =
    event.clientX >= dialogDimensions.left &&
    event.clientX <= dialogDimensions.right &&
    event.clientY >= dialogDimensions.top &&
    event.clientY <= dialogDimensions.bottom;

  if (!isInDialog) {
    refs.issueModal.close();
  }
});

loadAllIssues();

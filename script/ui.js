function normalizeText(value, fallback = 'N/A') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

export function formatDate(dateValue) {
  if (!dateValue) return 'N/A';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return normalizeText(dateValue);

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getIssueStatus(issue) {
  const rawStatus = issue?.status || issue?.category || '';
  const text = String(rawStatus).toLowerCase();
  return text.includes('closed') ? 'closed' : 'open';
}

function getCategoryName(issue) {
  return normalizeText(issue?.category || issue?.status, 'General');
}

function getLabelName(issue) {
  return normalizeText(issue?.label || issue?.labels?.[0] || issue?.tag, 'General');
}

function getAuthorName(issue) {
  return normalizeText(issue?.author || issue?.assignee || issue?.createdBy, 'Unknown');
}

function getPriority(issue) {
  return normalizeText(issue?.priority, 'Unknown');
}

function getId(issue) {
  return issue?._id || issue?.id;
}

function createBadgeClass(type, text) {
  const value = String(text).toLowerCase();

  if (type === 'category') {
    if (value.includes('open') || value.includes('bug')) return 'category-open';
    if (value.includes('closed') || value.includes('enhancement')) return 'category-closed';
  }

  return '';
}

function getStatusIcon(status) {
  if (status === "open") {
    return "assets/open.png";
  }
  if (status === "closed") {
    return "assets/closed.png";
  }
}

export function renderIssues(container, issues, onOpenDetails) {
  container.innerHTML = '';

  if (!issues.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No issues found</h3>
        <p>Try another tab or search with a different keyword.</p>
      </div>
    `;
    return;
  }

  issues.forEach((issue) => {
    const status = getIssueStatus(issue);
    const category = getCategoryName(issue);
    const label = getLabelName(issue);
    const author = getAuthorName(issue);
    const priority = getPriority(issue);
    const description = normalizeText(issue?.description, 'No description available.');
    const title = normalizeText(issue?.title, 'Untitled issue');
    const createdAt = formatDate(issue?.createdAt);
    const id = getId(issue);

    const card = document.createElement('article');
    card.className = `issue-card ${status === 'open' ? 'open-border' : 'closed-border'}`;
  const labelsArray = Array.isArray(issue.labels) ? issue.labels : [];

    card.innerHTML = `
      <div class="issue-top">
        <span class="issue-status ${status}">
  <img src="${getStatusIcon(status)}" alt="${status}">
</span>
        <span class="issue-priority">${priority}</span>
      </div>

      <button class="issue-title-btn" type="button">${title}</button>

      <p class="issue-desc">${description}</p>

     <div class="issue-badges">
  ${labelsArray.map(l => `<span class="badge label">${l}</span>`).join("")}
</div>
      <div class="issue-footer">
        <div class="issue-meta">By ${author}</div>
        <div class="issue-meta">${createdAt}</div>
      </div>
    `;

   card.addEventListener('click', () => onOpenDetails(id));
    container.appendChild(card);
  });
}

export function renderSummary(issues, elements, activeTab) {
  const openCount = issues.filter((issue) => getIssueStatus(issue) === 'open').length;
  const closedCount = issues.filter((issue) => getIssueStatus(issue) === 'closed').length;

  elements.issueCount.textContent = `${issues.length} ${issues.length === 1 ? 'Issue' : 'Issues'}`;
  elements.openCount.textContent = openCount;
  elements.closedCount.textContent = closedCount;

  const viewTextMap = {
    all: 'Showing all issues',
    open: 'Showing open issues',
    closed: 'Showing closed issues',
    search: 'Showing search results',
  };

  elements.activeViewText.textContent = viewTextMap[activeTab] || 'Showing issues';
}

export function setActiveTab(tabButtons, activeTab) {
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === activeTab);
  });
}

export function fillModal(issue, refs) {
  const status = getIssueStatus(issue);
  const label = getLabelName(issue);
  const author = getAuthorName(issue);
  const priority = getPriority(issue);

  refs.modalTitle.textContent = normalizeText(issue?.title, 'Untitled issue');
  refs.modalMetaLine.textContent =
    `${status.toUpperCase()} • ${status === 'closed' ? 'Closed' : 'Opened'} by ${author} • ${formatDate(issue?.createdAt)}`;
  refs.modalLabel.textContent = label;
  refs.modalDescription.textContent = normalizeText(
    issue?.description,
    'No description available.'
  );
  refs.modalAuthor.textContent = author;
  refs.modalPriority.textContent = priority;
}

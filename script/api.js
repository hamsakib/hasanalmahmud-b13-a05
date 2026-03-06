const BASE_URL = 'https://phi-lab-server.vercel.app/api/v1/lab';

async function request(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.data ?? data;
}

export async function fetchAllIssues() {
  return request(`${BASE_URL}/issues`);
}

export async function fetchSingleIssue(id) {
  return request(`${BASE_URL}/issue/${id}`);
}

export async function searchIssues(searchText) {
  return request(`${BASE_URL}/issues/search?q=${encodeURIComponent(searchText)}`);
}

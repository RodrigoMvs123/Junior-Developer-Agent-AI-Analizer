import { BugTicket, Severity, Status } from './types';

export const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const cleanUrl = url.trim();
    
    // Handle full URL https://github.com/owner/repo
    if (cleanUrl.startsWith('http')) {
      const urlObj = new URL(cleanUrl);
      let path = urlObj.pathname;
      
      // Remove .git suffix from pathname if present
      if (path.endsWith('.git')) {
        path = path.slice(0, -4);
      }
      
      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }
    
    // Handle owner/repo format (potentially with .git suffix manually typed)
    let path = cleanUrl;
    if (path.endsWith('.git')) {
      path = path.slice(0, -4);
    }
    
    const parts = path.split('/');
    if (parts.length === 2) {
      return { owner: parts[0].trim(), repo: parts[1].trim() };
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const fetchGithubIssues = async (owner: string, repo: string, token?: string): Promise<BugTicket[]> => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  // Only add token if provided and non-empty
  if (token && token.trim().length > 0) {
    headers['Authorization'] = `token ${token}`;
  }

  let allIssues: any[] = [];
  let page = 1;
  const PER_PAGE = 100;
  // Increase limit to 10 pages (1000 items) to cover larger repos like cli/cli
  // Note: Without a token, this might hit rate limits (60req/hr), but satisfies the requirement to load more data.
  const MAX_PAGES = 10; 

  try {
    while (page <= MAX_PAGES) {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=${PER_PAGE}&page=${page}`, { headers });
      
      if (!response.ok) {
        // If the first page fails, throw error. If subsequent pages fail (e.g. rate limit), return what we have.
        if (page === 1) {
          if (response.status === 404) throw new Error("Repository not found");
          if (response.status === 403) throw new Error("API rate limit exceeded or access denied");
          throw new Error(`GitHub API Error: ${response.statusText}`);
        }
        break; 
      }

      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        break;
      }

      allIssues = [...allIssues, ...data];
      
      // If we got fewer items than requested, we've reached the last page
      if (data.length < PER_PAGE) {
        break;
      }
      
      page++;
    }

    return allIssues.map((issue: any) => {
      // Determine severity from labels
      let severity: Severity = 'medium';
      const labels = issue.labels.map((l: any) => l.name);
      const lowerLabels = labels.map((l: string) => l.toLowerCase());
      
      if (lowerLabels.some((l: string) => l.includes('critical') || l.includes('urgent') || l.includes('security'))) severity = 'critical';
      else if (lowerLabels.some((l: string) => l.includes('high') || l.includes('major'))) severity = 'high';
      else if (lowerLabels.some((l: string) => l.includes('low') || l.includes('minor'))) severity = 'low';

      // Map status
      let status: Status = 'open';
      if (issue.assignee) status = 'in_progress';
      if (issue.pull_request) status = 'awaiting_review'; // Treat PRs as awaiting review or similar

      return {
        id: issue.number.toString(),
        title: issue.title,
        description: issue.body || 'No description provided.',
        repository: `${owner}/${repo}`,
        severity,
        status,
        labels,
        assignedAt: issue.created_at,
        estimatedCompletion: issue.pull_request ? 0 : 45, // Arbitrary estimate
        author: issue.user.login,
        comments: issue.comments,
        url: issue.html_url,
        isPullRequest: !!issue.pull_request
      };
    });
  } catch (error) {
    console.error("Error fetching GitHub issues:", error);
    throw error;
  }
};
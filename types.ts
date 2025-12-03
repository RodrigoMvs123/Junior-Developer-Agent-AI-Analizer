export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'open' | 'in_progress' | 'awaiting_review' | 'resolved';

export interface BugTicket {
  id: string;
  title: string;
  description: string;
  repository: string;
  severity: Severity;
  status: Status;
  labels: string[];
  assignedAt: string; // ISO Date string
  estimatedCompletion: number; // minutes
  author: string;
  comments: number;
  url?: string;
  isPullRequest?: boolean;
}

export interface AgentActivity {
  id: string;
  bugId?: string;
  timestamp: string; // ISO Date string
  action: string;
  details: string;
  type: 'commit' | 'analysis' | 'comment' | 'pr' | 'system';
}

export interface PullRequest {
  id: string;
  bugId: string;
  title: string;
  branch: string;
  status: 'open' | 'merged' | 'closed';
  checks: {
    tests: boolean;
    linting: boolean;
    security: boolean;
  };
  filesChanged: number;
  additions: number;
  deletions: number;
}

export interface AnalysisResult {
  rootCause: string;
  proposedSolution: string;
  filesToModify: string[];
  confidence: number;
  suggestedGitComment: string;
}
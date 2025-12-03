import React from 'react';
import { CheckCircle2, XCircle, FileCode, GitPullRequest, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';
import { PullRequest, BugTicket } from './types';

interface PullRequestPanelProps {
  pr: PullRequest;
  bug: BugTicket;
  onBack: () => void;
}

const PullRequestPanel: React.FC<PullRequestPanelProps> = ({ pr, bug, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-github-bg text-github-text animate-fade-in">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-github-border">
        <button 
          onClick={onBack}
          className="text-sm text-blue-400 hover:underline mb-2 flex items-center gap-1"
        >
          ← Back to Bug #{bug.id}
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
              {pr.title} <span className="text-github-muted font-normal">#{pr.id}</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-900 text-xs font-medium flex items-center gap-1">
                <GitPullRequest className="w-3 h-3" /> Open
              </span>
              <span className="text-github-muted text-sm">
                 wants to merge 1 commit into <code className="bg-github-btn px-1 rounded text-xs">main</code> from <code className="bg-github-btn px-1 rounded text-xs">{pr.branch}</code>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Checks */}
          <div className="bg-github-card border border-github-border rounded-md overflow-hidden">
            <div className="bg-github-btn/50 px-4 py-2 border-b border-github-border flex justify-between items-center">
              <span className="font-semibold text-sm">All checks passed</span>
              <span className="text-green-400 text-sm">3 successful</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-github-muted" />
                  <span>Build & Test</span>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="w-4 h-4" /> Passed
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-github-muted" />
                  <span>Linting</span>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="w-4 h-4" /> Passed
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-github-muted" />
                  <span>Security Scan</span>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="w-4 h-4" /> Passed
                </div>
              </div>
            </div>
          </div>

          {/* File Diff Mockup */}
          <div className="bg-github-card border border-github-border rounded-md">
            <div className="bg-github-btn/30 px-4 py-2 border-b border-github-border flex justify-between items-center">
               <div className="flex items-center gap-2 text-sm font-mono">
                 <FileCode className="w-4 h-4 text-github-muted" />
                 src/auth/middleware.js
               </div>
               <span className="text-xs text-github-muted">View file</span>
            </div>
            <div className="p-0 overflow-x-auto text-sm font-mono">
              <div className="flex bg-[#0d1117] min-w-full">
                <div className="w-12 flex-shrink-0 text-right pr-2 select-none text-github-muted bg-github-card border-r border-github-border opacity-50 py-1">
                   46<br/>47<br/>48<br/>49<br/>50
                </div>
                <div className="w-full py-1">
                   <div className="px-4 text-github-muted">const token = req.headers['authorization'];</div>
                   <div className="px-4 bg-red-900/20 text-red-200">- if (!validateToken(token)) return res.status(401);</div>
                   <div className="px-4 bg-green-900/20 text-green-200">+ const validation = validateToken(token);</div>
                   <div className="px-4 bg-green-900/20 text-green-200">+ if (!validation.valid && validation.reason === 'expired') {'{'}</div>
                   <div className="px-4 bg-green-900/20 text-green-200">+   return refreshAndRetry(req, res);</div>
                   <div className="px-4 bg-green-900/20 text-green-200">+ {'}'}</div>
                   <div className="px-4 bg-green-900/20 text-green-200">+ if (!validation.valid) return res.status(401);</div>
                   <div className="px-4 text-github-muted">next();</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <button className="px-4 py-2 bg-github-btn border border-github-border rounded-md text-sm font-medium hover:bg-github-btnHover transition-colors">
                Request Changes
             </button>
             <button className="px-4 py-2 bg-github-primary text-white rounded-md text-sm font-medium hover:bg-github-primaryHover transition-colors shadow-sm">
                Approve & Merge
             </button>
          </div>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-github-card border border-github-border rounded-md p-4">
             <h3 className="text-sm font-bold text-github-muted uppercase mb-3">Changes</h3>
             <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-400">
                   +{pr.additions} additions
                </span>
                <span className="flex items-center gap-1 text-red-400">
                   -{pr.deletions} deletions
                </span>
                <span className="text-github-muted flex items-center gap-1">
                   <FileCode className="w-3 h-3" /> {pr.filesChanged} files
                </span>
             </div>
          </div>

          <div className="bg-github-card border border-github-border rounded-md p-4">
             <h3 className="text-sm font-bold text-github-muted uppercase mb-3">Reviewers</h3>
             <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white">SR</div>
                <span className="text-sm">Senior Dev</span>
                <span className="ml-auto text-yellow-500 text-xs flex items-center gap-1">● Pending</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PullRequestPanel;
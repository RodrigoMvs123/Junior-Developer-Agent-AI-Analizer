import React, { useState, useEffect } from 'react';
import { BugTicket } from './types';
import { AlertCircle, CheckCircle2, Clock, Github, Search, Loader2, GitPullRequest, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardProps {
  bugs: BugTicket[];
  onSelectBug: (bug: BugTicket) => void;
  onLoadRepo: (repo: string, token: string) => Promise<void>;
  isLoadingRepo: boolean;
  repoError: string | null;
  onDeleteBug: (id: string) => void;
  onClearAll: () => void;
}

const ITEMS_PER_PAGE = 6;

const Dashboard: React.FC<DashboardProps> = ({ bugs, onSelectBug, onLoadRepo, isLoadingRepo, repoError, onDeleteBug, onClearAll }) => {
  const [repoInput, setRepoInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 if the total number of pages decreases below current page (e.g. deletions)
  // or if bugs array is cleared/replaced significantly. 
  // We use bugs.length to detect major changes for safety.
  useEffect(() => {
    const totalPages = Math.ceil(bugs.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (bugs.length === 0) {
      setCurrentPage(1);
    }
  }, [bugs.length, currentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim()) {
      onLoadRepo(repoInput, '');
      setCurrentPage(1); // Reset to first page on new search
    }
  };

  const stats = {
    open: bugs.filter(b => b.status === 'open' && !b.isPullRequest).length,
    prs: bugs.filter(b => b.isPullRequest).length,
    resolved: bugs.filter(b => b.status === 'resolved').length,
    inProgress: bugs.filter(b => b.status === 'in_progress').length,
  };

  const totalPages = Math.ceil(bugs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBugs = bugs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Repository Connection */}
      <div className="bg-github-card border border-github-border rounded-md p-4">
        <h2 className="text-sm font-semibold mb-3 text-white flex items-center gap-2">
          <Github className="w-4 h-4" /> Connect Repository
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 items-start md:items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="owner/repo (e.g. facebook/react) or full URL"
              className="w-full bg-github-bg border border-github-border rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoadingRepo || !repoInput.trim()}
            className="w-full md:w-auto bg-github-primary hover:bg-github-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {isLoadingRepo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Analyze Repo
          </button>
        </form>
        {repoError && (
          <div className="mt-3 p-2 bg-red-900/20 border border-red-900/50 rounded text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {repoError}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-github-card border border-github-border rounded-md p-4 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-github-muted text-sm font-medium">Open Issues</span>
            <AlertCircle className="w-5 h-5 text-green-400" />
          </div>
          <span className="text-3xl font-bold text-white">{stats.open + stats.inProgress}</span>
        </div>
        <div className="bg-github-card border border-github-border rounded-md p-4 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-github-muted text-sm font-medium">Open Pull Requests</span>
            <GitPullRequest className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-3xl font-bold text-white">{stats.prs}</span>
        </div>
        <div className="bg-github-card border border-github-border rounded-md p-4 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-github-muted text-sm font-medium">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-3xl font-bold text-white">{stats.resolved}</span>
        </div>
      </div>

      {/* Bug List */}
      <div className="bg-github-card border border-github-border rounded-md overflow-hidden flex flex-col h-[600px]">
        <div className="bg-github-btn/50 px-4 py-3 border-b border-github-border flex justify-between items-center flex-shrink-0">
          <h2 className="font-semibold text-sm">Issues & Pull Requests</h2>
          {bugs.length > 0 && (
            <button 
              onClick={onClearAll}
              className="flex gap-2 text-xs text-github-muted cursor-pointer hover:text-red-400 transition-colors items-center"
              title="Clear all items"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>
        
        <div className="divide-y divide-github-border flex-1 overflow-y-auto custom-scrollbar">
          {bugs.length === 0 ? (
            <div className="p-8 text-center text-github-muted flex flex-col items-center justify-center h-full">
               <Search className="w-8 h-8 mb-2 opacity-50" />
               <p>No issues found or repository not loaded.</p>
            </div>
          ) : (
            currentBugs.map(bug => (
              <div 
                key={bug.id} 
                className="p-4 hover:bg-github-btn/30 transition-colors cursor-pointer group"
                onClick={() => onSelectBug(bug)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3 min-w-0">
                    {bug.status === 'resolved' ? (
                      <CheckCircle2 className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                    ) : bug.isPullRequest ? (
                       <GitPullRequest className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
                    ) : (
                       <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${bug.status === 'open' ? 'text-green-500' : 'text-purple-500'}`} />
                    )}
                    <div className="min-w-0">
                      <h3 className={`font-semibold group-hover:underline text-base mb-1 truncate pr-2 ${bug.status === 'resolved' ? 'text-github-muted line-through' : 'text-blue-400'}`}>
                        {bug.title}
                      </h3>
                      <div className="text-xs text-github-muted flex flex-wrap items-center gap-2">
                        <span>#{bug.id}</span>
                        <span>•</span>
                        <span>{bug.isPullRequest ? 'Opened' : 'Reported'} by {bug.author}</span>
                        {!bug.isPullRequest && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Est. {bug.estimatedCompletion}m
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-github-muted">{new Date(bug.assignedAt).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBug(bug.id);
                        }}
                        className="text-github-muted hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from dashboard"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {bug.labels.slice(0, 2).map(label => (
                        <span key={label} className="px-2 py-0.5 rounded-full bg-github-border/50 text-xs text-github-muted border border-github-border whitespace-nowrap">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {bugs.length > 0 && totalPages > 1 && (
          <div className="p-3 border-t border-github-border flex items-center justify-between bg-github-btn/20 text-xs flex-shrink-0">
             <span className="text-github-muted hidden sm:block">
                 Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, bugs.length)} of {bugs.length}
             </span>
             <div className="flex gap-1 items-center mx-auto sm:mx-0">
                 <button 
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="p-1 rounded hover:bg-github-btn disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-github-text"
                 >
                     <ChevronLeft className="w-4 h-4" />
                 </button>
                 
                 <div className="flex gap-1">
                   {(() => {
                      let pages = [];
                      if (totalPages <= 7) {
                         pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                      } else {
                         pages.push(1);
                         
                         if (currentPage > 3) {
                             pages.push('...');
                         }
                         
                         let start = Math.max(2, currentPage - 1);
                         let end = Math.min(totalPages - 1, currentPage + 1);
                         
                         if (currentPage < 3) {
                             end = 4;
                         }
                         if (currentPage > totalPages - 2) {
                             start = totalPages - 3;
                         }

                         for (let i = start; i <= end; i++) {
                             pages.push(i);
                         }
                         
                         if (currentPage < totalPages - 2) {
                             pages.push('...');
                         }
                         
                         pages.push(totalPages);
                      }

                      return pages.map((page, idx) => {
                          if (page === '...') {
                              return <span key={`ellipsis-${idx}`} className="w-6 h-6 flex items-center justify-center text-github-muted select-none">...</span>;
                          }
                          return (
                              <button
                                  key={page}
                                  onClick={() => handlePageChange(page as number)}
                                  className={`min-w-[1.5rem] h-6 px-1 rounded flex items-center justify-center transition-colors ${
                                      currentPage === page 
                                      ? 'bg-blue-600 text-white font-medium' 
                                      : 'hover:bg-github-btn text-github-muted hover:text-white'
                                  }`}
                              >
                                  {page}
                              </button>
                          );
                      });
                   })()}
                 </div>

                  <button 
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="p-1 rounded hover:bg-github-btn disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-github-text"
                 >
                     <ChevronRight className="w-4 h-4" />
                 </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
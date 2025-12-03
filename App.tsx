import React, { useState } from 'react';
import { BugTicket, AgentActivity } from './types';
import Dashboard from './Dashboard';
import BugDetail from './BugDetail';
import ActivityFeed from './ActivityFeed';
import { Zap, Menu, Github } from 'lucide-react';
import { fetchGithubIssues, parseRepoUrl } from './githubService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'bug-detail'>('dashboard');
  const [selectedBug, setSelectedBug] = useState<BugTicket | null>(null);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  
  // Repo State
  const [bugs, setBugs] = useState<BugTicket[]>([]);
  const [isLoadingRepo, setIsLoadingRepo] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const handleSelectBug = (bug: BugTicket) => {
    setSelectedBug(bug);
    setCurrentView('bug-detail');
  };

  const handleLoadRepo = async (repoInput: string, token: string) => {
    setRepoError(null);
    setIsLoadingRepo(true);
    
    const parsed = parseRepoUrl(repoInput);
    if (!parsed) {
      setRepoError("Invalid repository URL or format. Use 'owner/repo'.");
      setIsLoadingRepo(false);
      return;
    }

    try {
      addActivity('Fetching Repository', `Loading data from ${parsed.owner}/${parsed.repo}`, 'system');
      const fetchedBugs = await fetchGithubIssues(parsed.owner, parsed.repo, token);
      setBugs(fetchedBugs);
      addActivity('Repository Loaded', `Successfully fetched ${fetchedBugs.length} issues/PRs from ${parsed.owner}/${parsed.repo}`, 'system');
    } catch (err: any) {
      setRepoError(err.message || "Failed to fetch repository data.");
      addActivity('Fetch Failed', `Error loading repo: ${err.message}`, 'system');
    } finally {
      setIsLoadingRepo(false);
    }
  };

  const handleDeleteBug = (id: string) => {
    setBugs((prev) => prev.filter(bug => bug.id !== id));
    addActivity('Item Removed', `Removed item #${id} from dashboard`, 'system');
  };

  const handleResolveBug = (id: string) => {
    setBugs(prev => prev.map(bug => 
      bug.id === id ? { ...bug, status: 'resolved' } : bug
    ));
    
    // Also update the currently selected bug so the detail view updates immediately
    if (selectedBug && selectedBug.id === id) {
      setSelectedBug(prev => prev ? { ...prev, status: 'resolved' } : null);
    }

    addActivity('Issue Resolved', `Marked item #${id} as resolved after copying analysis`, 'system');
  };

  const handleClearAll = () => {
    setBugs([]);
    addActivity('Dashboard Cleared', 'Removed all issues and pull requests', 'system');
  };

  const handleClearActivity = () => {
    setActivities([]);
  };

  const addActivity = (action: string, details: string, type: AgentActivity['type']) => {
    const newActivity: AgentActivity = {
      id: Math.random().toString(),
      bugId: selectedBug?.id,
      timestamp: new Date().toISOString(),
      action,
      details,
      type
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  return (
    <div className="flex h-screen bg-github-bg text-github-text font-sans selection:bg-blue-900/30">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-github-border hidden md:flex flex-col bg-github-bg">
        <div className="p-4 border-b border-github-border flex items-center gap-2">
          <Zap className="w-6 h-6 text-green-500" />
          <span className="font-bold text-lg tracking-tight">Junior Agent</span>
        </div>
        
        <div className="flex-1 p-4 overflow-hidden h-full">
          <ActivityFeed activities={activities} onClearActivity={handleClearActivity} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-github-border flex items-center justify-between px-6 bg-github-card">
          <div className="flex items-center gap-4 md:hidden">
            <Menu className="w-5 h-5 text-github-muted" />
            <span className="font-bold">Junior Agent</span>
          </div>
          
          <div className="hidden md:block text-sm text-github-muted">
            <span className="bg-github-btn px-2 py-1 rounded text-xs border border-github-border mr-2">BETA</span>
            System functioning normally
          </div>

          <div className="flex items-center gap-4">
             <a href="https://github.com" target="_blank" rel="noreferrer" className="text-github-muted hover:text-white transition-colors">
               <Github className="w-5 h-5" />
             </a>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {currentView === 'dashboard' && (
              <Dashboard 
                bugs={bugs} 
                onSelectBug={handleSelectBug} 
                onLoadRepo={handleLoadRepo}
                isLoadingRepo={isLoadingRepo}
                repoError={repoError}
                onDeleteBug={handleDeleteBug}
                onClearAll={handleClearAll}
              />
            )}
            
            {currentView === 'bug-detail' && selectedBug && (
              <BugDetail 
                bug={selectedBug} 
                onBack={() => setCurrentView('dashboard')}
                onAddActivity={addActivity}
                onResolve={handleResolveBug}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
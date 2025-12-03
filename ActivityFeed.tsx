import React from 'react';
import { GitCommit, Search, MessageSquare, GitPullRequest, Activity, Trash2 } from 'lucide-react';
import { AgentActivity } from './types';

interface ActivityFeedProps {
  activities: AgentActivity[];
  onClearActivity: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onClearActivity }) => {
  const getIcon = (type: AgentActivity['type']) => {
    switch (type) {
      case 'commit': return <GitCommit className="w-4 h-4 text-yellow-500" />;
      case 'analysis': return <Search className="w-4 h-4 text-blue-400" />;
      case 'pr': return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-gray-400" />;
      default: return <Activity className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="bg-github-card border border-github-border rounded-md p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-4 text-github-text flex items-center gap-2 flex-shrink-0">
        <Activity className="w-4 h-4" /> Agent Activity
      </h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="relative border-l border-github-border ml-2 space-y-6">
          {activities.length === 0 && (
            <div className="ml-6 text-xs text-github-muted italic">
              No recent activity recorded.
            </div>
          )}
          {activities.map((activity) => (
            <div key={activity.id} className="mb-4 ml-6 relative group">
              <span className="absolute -left-[31px] top-1 bg-github-card border border-github-border p-1 rounded-full">
                {getIcon(activity.type)}
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-github-muted mb-1">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-sm font-medium text-gray-200">{activity.action}</span>
                <p className="text-xs text-github-muted mt-1 break-words">{activity.details}</p>
                {activity.bugId && (
                  <span className="text-xs text-blue-400 mt-1 cursor-pointer hover:underline">
                    #{activity.bugId}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {activities.length > 0 && (
        <div className="pt-3 mt-3 border-t border-github-border flex justify-center flex-shrink-0">
          <button 
            onClick={onClearActivity}
            className="flex items-center gap-1 text-xs text-github-muted hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Clear Activity Log
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
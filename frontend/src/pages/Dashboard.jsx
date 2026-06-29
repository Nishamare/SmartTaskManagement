import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { StatCard, SkeletonCard, StatusBadge, PriorityBadge } from '../components/UI';
import { formatDate, isOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const res = await projectAPI.getStats();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Hero Banner */}
      <div
        className="rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)',
        }}
      >
        {/* SVG Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        {/* Blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl" />

        {/* SVG Icon */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="10" y="10" width="45" height="45" rx="8" stroke="white" strokeWidth="3"/>
            <rect x="65" y="10" width="45" height="45" rx="8" stroke="white" strokeWidth="3"/>
            <rect x="10" y="65" width="45" height="45" rx="8" stroke="white" strokeWidth="3"/>
            <rect x="65" y="65" width="45" height="45" rx="8" stroke="white" strokeWidth="3"/>
            <line x1="32" y1="32" x2="43" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <line x1="32" y1="40" x2="38" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <line x1="87" y1="32" x2="98" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <line x1="87" y1="40" x2="93" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-medium mb-1">
            Dashboard Overview
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">
            👋 Welcome back, {user?.name}!
          </h1>
          <p className="text-indigo-200 text-sm">
            Here's what's happening with your projects today.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Projects"
            value={stats?.projectStats?.total_projects}
            icon="📁" color="indigo"
          />
          <StatCard
            label="Active Projects"
            value={stats?.projectStats?.active_projects}
            icon="🚀" color="blue"
          />
          <StatCard
            label="Total Tasks"
            value={stats?.taskStats?.total_tasks}
            icon="✅" color="green"
          />
          <StatCard
            label="Overdue Tasks"
            value={stats?.taskStats?.overdue_tasks}
            icon="⚠️" color="red"
          />
        </div>
      )}

      {/* Task Stats */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="To Do"            value={stats?.taskStats?.todo_tasks}        icon="📋" color="indigo" />
          <StatCard label="In Progress"      value={stats?.taskStats?.in_progress_tasks} icon="⚡" color="yellow" />
          <StatCard label="Completed Tasks"  value={stats?.taskStats?.completed_tasks}   icon="🎯" color="green"  />
        </div>
      )}

      {/* Recent Projects + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Projects */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800
                          flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #4f46e510, #7c3aed10)' }}
          >
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              📁 Recent Projects
            </h2>
            <button onClick={() => navigate('/projects')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </button>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : stats?.recentProjects?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📁</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  No projects yet
                </p>
                <button onClick={() => navigate('/projects')} className="btn-primary text-xs">
                  Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.recentProjects?.map((project) => (
                  <div key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl
                               hover:bg-gray-50 dark:hover:bg-gray-800
                               cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center
                                    text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    >
                      {project.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900
                                    dark:text-gray-100 truncate group-hover:text-indigo-600">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(project.updated_at)}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800
                          flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #22c55e10, #06b6d410)' }}
          >
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              ✅ Recent Tasks
            </h2>
            <button onClick={() => navigate('/tasks')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </button>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : stats?.recentTasks?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  No tasks yet
                </p>
                <button onClick={() => navigate('/projects')} className="btn-primary text-xs">
                  Go to Projects
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.recentTasks?.map((task) => (
                  <div key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl
                               hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center
                                    text-white text-sm flex-shrink-0"
                      style={{ backgroundColor: task.project_color || '#6366f1' }}
                    >
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900
                                    dark:text-gray-100 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {task.project_name} •{' '}
                        <span className={isOverdue(task.due_date, task.status)
                          ? 'text-red-500' : ''}>
                          {formatDate(task.due_date)}
                        </span>
                      </p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
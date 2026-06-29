/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../utils/api';
import {
  StatusBadge, PriorityBadge,
  SkeletonCard, EmptyState
} from '../components/UI';
import { isOverdue, getDueDateLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterPriority]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskAPI.getMyTasks({
        status:   filterStatus,
        priority: filterPriority,
      });
      setTasks(res.data.tasks);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.updateStatus(taskId, status);
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, status } : t
      ));
      toast.success('Status updated!');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Group tasks by status
  const groupedTasks = {
    todo:        tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    in_review:   tasks.filter(t => t.status === 'in_review'),
    done:        tasks.filter(t => t.status === 'done'),
    cancelled:   tasks.filter(t => t.status === 'cancelled'),
  };

  const STATUS_CONFIG = [
    { key: 'todo',        label: '📋 To Do',       color: 'bg-gray-100 dark:bg-gray-800'   },
    { key: 'in_progress', label: '⚡ In Progress',  color: 'bg-blue-50 dark:bg-blue-950'    },
    { key: 'in_review',   label: '👁️ In Review',   color: 'bg-purple-50 dark:bg-purple-950'},
    { key: 'done',        label: '✅ Done',         color: 'bg-green-50 dark:bg-green-950'  },
    { key: 'cancelled',   label: '❌ Cancelled',    color: 'bg-red-50 dark:bg-red-950'      },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        {(filterStatus || filterPriority) && (
          <button
            onClick={() => {
              setFilterStatus('');
              setFilterPriority('');
            }}
            className="btn-secondary text-xs"
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No tasks found"
          description="You have no tasks assigned yet. Go to a project to create tasks."
          action={
            <button
              onClick={() => navigate('/projects')}
              className="btn-primary"
            >
              Go to Projects
            </button>
          }
        />
      ) : (
        <>
          {/* Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {STATUS_CONFIG.map(({ key, label, color }) => (
              <div
                key={key}
                className={`${color} rounded-xl p-3 text-center cursor-pointer
                            transition-all hover:shadow-md`}
                onClick={() => setFilterStatus(
                  filterStatus === key ? '' : key
                )}
              >
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groupedTasks[key].length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="card p-4 flex items-center gap-4
                           hover:shadow-md transition-all"
              >
                {/* Status Dropdown */}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="text-xs border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-800 rounded-lg px-2 py-1
                             text-gray-700 dark:text-gray-300
                             focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate
                    ${task.status === 'done'
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-900 dark:text-gray-100'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {/* Project Name */}
                    <span
                      onClick={() => navigate(`/projects/${task.project_id}`)}
                      className="text-xs font-medium cursor-pointer
                                 hover:underline flex items-center gap-1"
                      style={{ color: task.project_color || '#6366f1' }}
                    >
                      📁 {task.project_name}
                    </span>

                    <PriorityBadge priority={task.priority} />

                    {task.due_date && (
                      <span className={`text-xs ${
                        isOverdue(task.due_date, task.status)
                          ? 'text-red-500 font-medium'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        📅 {getDueDateLabel(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="hidden sm:block">
                  <StatusBadge status={task.status} />
                </div>

                {/* Go to Project */}
                <button
                  onClick={() => navigate(`/projects/${task.project_id}`)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600
                             hover:bg-indigo-50 dark:hover:bg-indigo-950
                             rounded transition-colors text-xs"
                >
                  →
                </button>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
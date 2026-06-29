/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI } from '../utils/api';
import {
  Modal, ConfirmDialog, StatusBadge, PriorityBadge,
  Avatar, Spinner, EmptyState
} from '../components/UI';
import { formatDate, isOverdue, getDueDateLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const INITIAL_TASK = {
  title: '', description: '', status: 'todo',
  priority: 'medium', due_date: '', estimated_hours: '', tags: '',
};

export default function ProjectDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [taskLoading, setTaskLoading] = useState(true);

  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch]                 = useState('');

  const [showTaskModal, setShowTaskModal]   = useState(false);
  const [editTask, setEditTask]             = useState(null);
  const [taskForm, setTaskForm]             = useState(INITIAL_TASK);
  const [taskErrors, setTaskErrors]         = useState({});
  const [saving, setSaving]                 = useState(false);

  const [deleteTaskId, setDeleteTaskId]     = useState(null);
  const [deleting, setDeleting]             = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail]         = useState('');
  const [memberRole, setMemberRole]           = useState('member');
  const [addingMember, setAddingMember]       = useState(false);

  useEffect(() => {
  fetchProject();
  fetchTasks();
  }, [id]);

  useEffect(() => {
  fetchTasks();
  }, [filterStatus, filterPriority, search]);

  const fetchProject = async () => {
    try {
      const res = await projectAPI.getById(id);
      setProject(res.data.project);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setTaskLoading(true);
    try {
      const res = await taskAPI.getByProject(id, {
        status:   filterStatus,
        priority: filterPriority,
        search,
      });
      setTasks(res.data.tasks);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setTaskLoading(false);
    }
  };

  const validateTask = () => {
    const errs = {};
    if (!taskForm.title.trim())
      errs.title = 'Task title is required';
    setTaskErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreateTask = () => {
    setEditTask(null);
    setTaskForm(INITIAL_TASK);
    setTaskErrors({});
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskForm({
      title:           task.title,
      description:     task.description  || '',
      status:          task.status,
      priority:        task.priority,
      due_date:        task.due_date?.split('T')[0] || '',
      estimated_hours: task.estimated_hours || '',
      tags:            task.tags || '',
    });
    setTaskErrors({});
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    if (!validateTask()) return;
    setSaving(true);
    try {
      if (editTask) {
        await taskAPI.update(editTask.id, taskForm);
        toast.success('Task updated!');
      } else {
        await taskAPI.create(id, taskForm);
        toast.success('Task created!');
      }
      setShowTaskModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.updateStatus(taskId, status);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
      toast.success('Status updated!');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async () => {
    setDeleting(true);
    try {
      await taskAPI.delete(deleteTaskId);
      toast.success('Task deleted!');
      setDeleteTaskId(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    setAddingMember(true);
    try {
      await projectAPI.addMember(id, { email: memberEmail, role: memberRole });
      toast.success('Member added!');
      setMemberEmail('');
      setShowMemberModal(false);
      fetchProject();
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        className="text-sm text-gray-500 hover:text-gray-700
                   dark:text-gray-400 dark:hover:text-gray-200
                   mb-4 flex items-center gap-1 transition-colors"
      >
        ← Back to Projects
      </button>

      {/* Project Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project?.color || '#6366f1' }}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project?.name}
              </h1>
              {project?.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={project?.status} />
            <PriorityBadge priority={project?.priority} />
          </div>
        </div>

        {/* Project Info */}
        <div className="flex flex-wrap gap-6 mt-4 pt-4
                        border-t border-gray-100 dark:border-gray-800">
          {project?.start_date && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(project.start_date)}
              </p>
            </div>
          )}
          {project?.end_date && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(project.end_date)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {project?.owner_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {tasks.length}
            </p>
          </div>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between mt-4 pt-4
                        border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mr-1">
              Members:
            </p>
            <div className="flex -space-x-2">
              {project?.members?.slice(0, 5).map((member) => (
                <Avatar
                  key={member.id}
                  name={member.name}
                  avatar={member.avatar}
                  size="sm"
                  className="ring-2 ring-white dark:ring-gray-900"
                />
              ))}
            </div>
            {project?.members?.length > 5 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{project.members.length - 5} more
              </span>
            )}
          </div>
          <button
            onClick={() => setShowMemberModal(true)}
            className="btn-secondary text-xs"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tasks ({tasks.length})
        </h2>
        <button onClick={openCreateTask} className="btn-primary">
          + Add Task
        </button>
      </div>

      {/* Task Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
        />
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
      </div>

      {/* Tasks List */}
      {taskLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No tasks found"
          description="Add your first task to get started"
          action={
            <button onClick={openCreateTask} className="btn-primary">
              + Add Task
            </button>
          }
        />
      ) : (
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
                onClick={(e) => e.stopPropagation()}
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
                  {task.assigned_to_name && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      👤 {task.assigned_to_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => openEditTask(task)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600
                             hover:bg-indigo-50 dark:hover:bg-indigo-950
                             rounded transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setDeleteTaskId(task.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600
                             hover:bg-red-50 dark:hover:bg-red-950
                             rounded transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editTask ? 'Edit Task' : 'Create New Task'}
        size="md"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="label">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => {
                setTaskForm({ ...taskForm, title: e.target.value });
                setTaskErrors({ ...taskErrors, title: '' });
              }}
              placeholder="Enter task title"
              className={`input ${taskErrors.title ? 'border-red-500' : ''}`}
            />
            {taskErrors.title && (
              <p className="mt-1 text-xs text-red-500">{taskErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Task description (optional)"
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="input"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Due Date + Estimated Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Estimated Hours</label>
              <input
                type="number"
                value={taskForm.estimated_hours}
                onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: e.target.value })}
                placeholder="e.g. 8"
                min="0"
                className="input"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags</label>
            <input
              type="text"
              value={taskForm.tags}
              onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
              placeholder="e.g. frontend, bug, urgent"
              className="input"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowTaskModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTask}
              disabled={saving}
              className="btn-primary"
            >
              {saving
                ? <><Spinner size="sm" /> Saving...</>
                : editTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title="Add Project Member"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="member@example.com"
              className="input"
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="input"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowMemberModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={addingMember}
              className="btn-primary"
            >
              {addingMember
                ? <><Spinner size="sm" /> Adding...</>
                : 'Add Member'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Task Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        loading={deleting}
      />

    </div>
  );
}
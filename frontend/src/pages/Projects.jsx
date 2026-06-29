import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../utils/api';
import { Modal, ConfirmDialog, StatusBadge, PriorityBadge, SkeletonCard, EmptyState, Spinner } from '../components/UI';
import { formatDate, PROJECT_COLORS } from '../utils/helpers';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  name: '', description: '', status: 'planning',
  priority: 'medium', start_date: '', end_date: '', color: '#6366f1',
};

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal]           = useState(false);
  const [editProject, setEditProject]       = useState(null);
  const [form, setForm]                     = useState(INITIAL_FORM);
  const [formErrors, setFormErrors]         = useState({});
  const [saving, setSaving]                 = useState(false);
  const [deleteId, setDeleteId]             = useState(null);
  const [deleting, setDeleting]             = useState(false);

  useEffect(() => {
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterStatus, filterPriority]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getAll({
        search, status: filterStatus, priority: filterPriority,
      });
      setProjects(res.data.projects);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim())          errs.name = 'Project name is required';
    else if (form.name.length < 2)  errs.name = 'Min 2 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreate = () => {
    setEditProject(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (e, project) => {
    e.stopPropagation();
    setEditProject(project);
    setForm({
      name:        project.name,
      description: project.description  || '',
      status:      project.status,
      priority:    project.priority,
      start_date:  project.start_date?.split('T')[0] || '',
      end_date:    project.end_date?.split('T')[0]   || '',
      color:       project.color || '#6366f1',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editProject) {
        await projectAPI.update(editProject.id, form);
        toast.success('Project updated!');
      } else {
        await projectAPI.create(form);
        toast.success('Project created!');
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectAPI.delete(deleteId);
      toast.success('Project deleted!');
      setDeleteId(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Hero Banner */}
      <div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)' }}
      >
        {/* SVG Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="proj-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#proj-dots)" />
        </svg>

        {/* Blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />

        {/* Project SVG Icon */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <rect x="5" y="15" width="90" height="70" rx="8" stroke="white" strokeWidth="3"/>
            <rect x="5" y="15" width="90" height="20" rx="8" stroke="white" strokeWidth="3" fill="white" fillOpacity="0.2"/>
            <line x1="20" y1="50" x2="50" y2="50" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <line x1="20" y1="62" x2="65" y2="62" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <line x1="20" y1="74" x2="45" y2="74" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">Project Management</p>
          <h1 className="text-3xl font-bold text-white mb-2">📁 My Projects</h1>
          <p className="text-blue-100 text-sm">
            Manage and track all your projects in one place
          </p>
        </div>
      </div>

      {/* Header + Button */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {projects.length} project{projects.length !== 1 ? 's' : ''} found
        </p>
        <button onClick={openCreate} className="btn-primary">
          + New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <select value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input max-w-xs">
          <option value="">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="input max-w-xs">
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        {(search || filterStatus || filterPriority) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); }}
            className="btn-secondary text-xs">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects found"
          description="Create your first project to get started"
          action={<button onClick={openCreate} className="btn-primary">+ New Project</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="card cursor-pointer hover:shadow-lg
                         transition-all duration-200 hover:-translate-y-1 overflow-hidden"
            >
              {/* Card Top Color Bar */}
              <div className="h-2 w-full"
                style={{ backgroundColor: project.color || '#6366f1' }} />

              <div className="p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center
                                    text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    >
                      {project.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white
                                   text-sm truncate max-w-[140px]">
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => openEdit(e, project)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600
                                 hover:bg-indigo-50 dark:hover:bg-indigo-950
                                 rounded transition-colors">
                      ✏️
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(project.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600
                                 hover:bg-red-50 dark:hover:bg-red-950
                                 rounded transition-colors">
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Badges */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3
                                border-t border-gray-100 dark:border-gray-800">
                  <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>📋 {project.task_count || 0}</span>
                    <span>👥 {project.member_count || 0}</span>
                  </div>
                  {project.end_date && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      📅 {formatDate(project.end_date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editProject ? 'Edit Project' : 'Create New Project'} size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Project Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormErrors({ ...formErrors, name: '' }); }}
              placeholder="Enter project name"
              className={`input ${formErrors.name ? 'border-red-500' : ''}`}
            />
            {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Project description (optional)"
              rows={3} className="input resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="input" />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="input" />
            </div>
          </div>

          <div>
            <label className="label">Project Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`w-7 h-7 rounded-full transition-transform
                    ${form.color === color
                      ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500'
                      : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <><Spinner size="sm" /> Saving...</> : editProject ? 'Update' : 'Create Project'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure? All tasks will be permanently deleted."
        confirmText="Delete Project" loading={deleting}
      />

    </div>
  );
}
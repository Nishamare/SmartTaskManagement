import React from 'react';
import {
  getInitials, getAvatarColor,
  PRIORITY_COLORS, STATUS_COLORS,
  STATUS_LABELS, PRIORITY_LABELS,
} from '../utils/helpers';

// ── Spinner ───────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  return (
    <div className={`${sizes[size]} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin ${className}`} />
  );
};

// ── Loading Page ──────────────────────────
export const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
    <div className="text-center">
      <Spinner size="xl" className="mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// ── Avatar ────────────────────────────────
export const Avatar = ({ name, avatar, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-16 h-16 text-xl',
  };
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }
  return (
    <div className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
};

// ── Priority Badge ────────────────────────
export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${PRIORITY_COLORS[priority] || ''}`}>
    {PRIORITY_LABELS[priority] || priority}
  </span>
);

// ── Status Badge ──────────────────────────
export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_COLORS[status] || ''}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

// ── Empty State ───────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-16 px-4">
    {icon && (
      <div className="text-5xl mb-4">{icon}</div>
    )}
    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
        {description}
      </p>
    )}
    {action}
  </div>
);

// ── Modal ─────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Modal Box */}
        <div className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full ${sizes[size]} z-10`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          {/* Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ── Confirm Dialog ────────────────────────
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
      {message}
    </p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="btn-secondary">
        Cancel
      </button>
      <button onClick={onConfirm} disabled={loading} className="btn-danger">
        {loading ? <Spinner size="sm" /> : confirmText}
      </button>
    </div>
  </Modal>
);

// ── Form Field ────────────────────────────
export const FormField = ({ label, error, required, children }) => (
  <div>
    {label && (
      <label className="label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {error && (
      <p className="mt-1 text-xs text-red-500">{error}</p>
    )}
  </div>
);

// ── Skeleton Card ─────────────────────────
export const SkeletonCard = () => (
  <div className="card p-4 space-y-3">
    <div className="skeleton h-4 w-3/4" />
    <div className="skeleton h-3 w-full" />
    <div className="skeleton h-3 w-1/2" />
    <div className="flex gap-2 mt-2">
      <div className="skeleton h-5 w-16 rounded-full" />
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
  </div>
);

// ── Stat Card ─────────────────────────────
export const StatCard = ({ label, value, icon, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
    green:  'bg-green-50  dark:bg-green-950  text-green-600  dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400',
    red:    'bg-red-50    dark:bg-red-950    text-red-600    dark:text-red-400',
    blue:   'bg-blue-50   dark:bg-blue-950   text-blue-600   dark:text-blue-400',
  };

  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value ?? 0}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
};
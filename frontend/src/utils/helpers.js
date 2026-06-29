// ── Date Helpers ──────────────────────────
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done' || status === 'cancelled') return false;
  return new Date(dueDate) < new Date();
};

export const getDueDateLabel = (dueDate) => {
  if (!dueDate) return null;
  const date  = new Date(dueDate);
  const today = new Date();
  const diff  = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
  if (diff === 0)  return 'Due today';
  if (diff === 1)  return 'Due tomorrow';
  if (diff < 0)    return `Overdue by ${Math.abs(diff)} days`;
  return `Due in ${diff} days`;
};

// ── Badge Colors ──────────────────────────
export const PRIORITY_COLORS = {
  low:      'bg-green-100  text-green-700  dark:bg-green-900  dark:text-green-300',
  medium:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100    text-red-700    dark:bg-red-900    dark:text-red-300',
};

export const STATUS_COLORS = {
  planning:    'bg-gray-100   text-gray-700   dark:bg-gray-800   dark:text-gray-300',
  active:      'bg-blue-100   text-blue-700   dark:bg-blue-900   dark:text-blue-300',
  on_hold:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  completed:   'bg-green-100  text-green-700  dark:bg-green-900  dark:text-green-300',
  cancelled:   'bg-red-100    text-red-700    dark:bg-red-900    dark:text-red-300',
  todo:        'bg-gray-100   text-gray-600   dark:bg-gray-800   dark:text-gray-400',
  in_progress: 'bg-blue-100   text-blue-700   dark:bg-blue-900   dark:text-blue-300',
  in_review:   'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  done:        'bg-green-100  text-green-700  dark:bg-green-900  dark:text-green-300',
};

export const STATUS_LABELS = {
  planning:    'Planning',
  active:      'Active',
  on_hold:     'On Hold',
  completed:   'Completed',
  cancelled:   'Cancelled',
  todo:        'To Do',
  in_progress: 'In Progress',
  in_review:   'In Review',
  done:        'Done',
};

export const PRIORITY_LABELS = {
  low:      'Low',
  medium:   'Medium',
  high:     'High',
  critical: 'Critical',
};

// ── Avatar Helpers ────────────────────────
export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
  'bg-red-500',    'bg-orange-500', 'bg-yellow-500',
  'bg-green-500',  'bg-teal-500',
];

export const getAvatarColor = (name) => {
  if (!name) return 'bg-indigo-500';
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

// ── Project Colors ────────────────────────
export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
];
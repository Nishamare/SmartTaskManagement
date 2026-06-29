const { pool }                           = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/tasks/project/:projectId
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigned_to, search } = req.query;

    let where    = 't.project_id = ?';
    const params = [projectId];

    if (status)      { where += ' AND t.status = ?';      params.push(status); }
    if (priority)    { where += ' AND t.priority = ?';    params.push(priority); }
    if (assigned_to) { where += ' AND t.assigned_to = ?'; params.push(assigned_to); }
    if (search) {
      where += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [tasks] = await pool.query(`
      SELECT
        t.*,
        u1.name   AS assigned_to_name,
        u1.avatar AS assigned_to_avatar,
        u2.name   AS created_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by  = u2.id
      WHERE ${where}
      ORDER BY
        FIELD(t.priority,'critical','high','medium','low'),
        t.due_date ASC,
        t.created_at DESC
    `, params);

    return successResponse(res, { data: { tasks } });
  } catch (err) { next(err); }
};

// GET /api/tasks/my
const getMyTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, priority } = req.query;

    let where    = '(t.assigned_to = ? OR t.created_by = ?)';
    const params = [userId, userId];

    if (status)   { where += ' AND t.status = ?';   params.push(status); }
    if (priority) { where += ' AND t.priority = ?'; params.push(priority); }

    const [tasks] = await pool.query(`
      SELECT
        t.*,
        p.name   AS project_name,
        p.color  AS project_color,
        u.name   AS assigned_to_name,
        u.avatar AS assigned_to_avatar
      FROM tasks t
      JOIN  projects p ON t.project_id  = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE ${where}
      ORDER BY t.due_date ASC, t.created_at DESC
      LIMIT 100
    `, params);

    return successResponse(res, { data: { tasks } });
  } catch (err) { next(err); }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [tasks] = await pool.query(`
      SELECT
        t.*,
        u1.name   AS assigned_to_name,
        u1.email  AS assigned_to_email,
        u1.avatar AS assigned_to_avatar,
        u2.name   AS created_by_name,
        p.name    AS project_name
      FROM tasks t
      LEFT JOIN users    u1 ON t.assigned_to = u1.id
      LEFT JOIN users    u2 ON t.created_by  = u2.id
      LEFT JOIN projects p  ON t.project_id  = p.id
      WHERE t.id = ?
    `, [id]);

    if (!tasks.length) {
      return errorResponse(res, { statusCode: 404, message: 'Task not found.' });
    }

    const [comments] = await pool.query(`
      SELECT tc.*, u.name AS user_name, u.avatar AS user_avatar
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at ASC
    `, [id]);

    return successResponse(res, {
      data: { task: { ...tasks[0], comments } },
    });
  } catch (err) { next(err); }
};

// POST /api/tasks/project/:projectId
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority,
            due_date, assigned_to, estimated_hours, tags } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO tasks
        (title, description, status, priority, due_date,
         project_id, assigned_to, created_by, estimated_hours, tags)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [title, description || null, status || 'todo', priority || 'medium',
       due_date || null, projectId, assigned_to || null,
       userId, estimated_hours || null, tags || null]
    );

    // Notify assignee
    if (assigned_to && parseInt(assigned_to) !== userId) {
      await pool.query(
        `INSERT INTO notifications
          (user_id, title, message, type, reference_id, reference_type)
         VALUES (?,?,?,?,?,?)`,
        [assigned_to, 'New Task Assigned',
         `You have been assigned: "${title}"`,
         'task_assigned', result.insertId, 'task']
      );
    }

    const [task] = await pool.query(`
      SELECT t.*,
        u1.name AS assigned_to_name,
        u2.name AS created_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by  = u2.id
      WHERE t.id = ?
    `, [result.insertId]);

    return successResponse(res, {
      statusCode: 201,
      message: 'Task created!',
      data: { task: task[0] },
    });
  } catch (err) { next(err); }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority,
            due_date, assigned_to, estimated_hours, actual_hours, tags } = req.body;

    const [rows] = await pool.query(
      'SELECT id FROM tasks WHERE id = ?', [id]
    );
    if (!rows.length) {
      return errorResponse(res, { statusCode: 404, message: 'Task not found.' });
    }

    await pool.query(
      `UPDATE tasks
       SET title=?, description=?, status=?, priority=?, due_date=?,
           assigned_to=?, estimated_hours=?, actual_hours=?, tags=?
       WHERE id=?`,
      [title, description, status, priority, due_date || null,
       assigned_to || null, estimated_hours || null,
       actual_hours || null, tags || null, id]
    );

    const [task] = await pool.query(`
      SELECT t.*,
        u1.name   AS assigned_to_name,
        u1.avatar AS assigned_to_avatar,
        u2.name   AS created_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by  = u2.id
      WHERE t.id = ?
    `, [id]);

    return successResponse(res, {
      message: 'Task updated!',
      data: { task: task[0] },
    });
  } catch (err) { next(err); }
};

// PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const valid = ['todo', 'in_progress', 'in_review', 'done', 'cancelled'];
    if (!valid.includes(status)) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Invalid status. Must be one of: ${valid.join(', ')}`,
      });
    }

    await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);

    return successResponse(res, {
      message: 'Status updated!',
      data: { id: parseInt(id), status },
    });
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT created_by FROM tasks WHERE id = ?', [id]
    );
    if (!rows.length) {
      return errorResponse(res, { statusCode: 404, message: 'Task not found.' });
    }
    if (rows[0].created_by !== userId && req.user.role !== 'admin') {
      return errorResponse(res, { statusCode: 403, message: 'Only the task creator or admin can delete.' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    return successResponse(res, { message: 'Task deleted!' });
  } catch (err) { next(err); }
};

// POST /api/tasks/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { id }      = req.params;
    const { comment } = req.body;
    const userId      = req.user.id;

    if (!comment?.trim()) {
      return errorResponse(res, { statusCode: 400, message: 'Comment cannot be empty.' });
    }

    const [result] = await pool.query(
      'INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [id, userId, comment.trim()]
    );

    const [rows] = await pool.query(`
      SELECT tc.*, u.name AS user_name, u.avatar AS user_avatar
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.id = ?
    `, [result.insertId]);

    return successResponse(res, {
      statusCode: 201,
      message: 'Comment added!',
      data: { comment: rows[0] },
    });
  } catch (err) { next(err); }
};

// GET /api/tasks/notifications
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [userId]
    );
    const [unread] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    return successResponse(res, {
      data: { notifications, unread_count: unread[0].count },
    });
  } catch (err) { next(err); }
};

// PATCH /api/tasks/notifications/read
const markAllRead = async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [req.user.id]
    );
    return successResponse(res, { message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
};

module.exports = {
  getTasksByProject, getMyTasks, getTaskById,
  createTask, updateTask, updateTaskStatus, deleteTask,
  addComment, getNotifications, markAllRead,
};
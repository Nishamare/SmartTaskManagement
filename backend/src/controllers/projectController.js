const { pool }                           = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/projects
const getAllProjects = async (req, res, next) => {
  try {
    const { search, status, priority, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.id;

    let where  = '(p.owner_id = ? OR pm.user_id = ?)';
    const params = [userId, userId];

    if (search) {
      where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status)   { where += ' AND p.status = ?';   params.push(status); }
    if (priority) { where += ' AND p.priority = ?'; params.push(priority); }

    const dataSQL = `
      SELECT DISTINCT
        p.*,
        u.name   AS owner_name,
        u.avatar AS owner_avatar,
        (SELECT COUNT(*) FROM tasks t          WHERE t.project_id  = p.id)                       AS task_count,
        (SELECT COUNT(*) FROM tasks t          WHERE t.project_id  = p.id AND t.status = 'done') AS completed_tasks,
        (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id)                   AS member_count
      FROM projects p
      LEFT JOIN users           u  ON p.owner_id  = u.id
      LEFT JOIN project_members pm ON p.id        = pm.project_id
      WHERE ${where}
      ORDER BY p.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSQL = `
      SELECT COUNT(DISTINCT p.id) AS total
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE ${where}
    `;

    const [projects] = await pool.query(dataSQL,  [...params, parseInt(limit), offset]);
    const [countRow] = await pool.query(countSQL,  params);
    const total      = countRow[0]?.total || 0;

    return successResponse(res, {
      data: {
        projects,
        pagination: {
          page:  parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) { next(err); }
};

// GET /api/projects/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [pStats] = await pool.query(`
      SELECT
        COUNT(DISTINCT p.id)                                             AS total_projects,
        SUM(CASE WHEN p.status = 'active'    THEN 1 ELSE 0 END)        AS active_projects,
        SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END)        AS completed_projects,
        SUM(CASE WHEN p.status = 'on_hold'   THEN 1 ELSE 0 END)        AS on_hold_projects
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = ? OR pm.user_id = ?
    `, [userId, userId]);

    const [tStats] = await pool.query(`
      SELECT
        COUNT(t.id)                                                                AS total_tasks,
        SUM(CASE WHEN t.status = 'done'        THEN 1 ELSE 0 END)                AS completed_tasks,
        SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END)                AS in_progress_tasks,
        SUM(CASE WHEN t.status = 'todo'        THEN 1 ELSE 0 END)                AS todo_tasks,
        SUM(CASE WHEN t.due_date < CURDATE() 
            AND t.status NOT IN ('done','cancelled') THEN 1 ELSE 0 END)           AS overdue_tasks
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = ? OR pm.user_id = ?
    `, [userId, userId]);

    const [recentProjects] = await pool.query(`
      SELECT DISTINCT p.id, p.name, p.status, p.priority, p.color, p.end_date, p.updated_at
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = ? OR pm.user_id = ?
      ORDER BY p.updated_at DESC LIMIT 5
    `, [userId, userId]);

    const [recentTasks] = await pool.query(`
      SELECT t.id, t.title, t.status, t.priority, t.due_date,
             p.name AS project_name, p.color AS project_color
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.assigned_to = ? OR t.created_by = ?
      ORDER BY t.updated_at DESC LIMIT 5
    `, [userId, userId]);

    return successResponse(res, {
      data: { projectStats: pStats[0], taskStats: tStats[0], recentProjects, recentTasks },
    });
  } catch (err) { next(err); }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const { id }   = req.params;
    const userId   = req.user.id;

    const [rows] = await pool.query(`
      SELECT p.*, u.name AS owner_name, u.avatar AS owner_avatar
      FROM projects p JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (!rows.length) {
      return errorResponse(res, { statusCode: 404, message: 'Project not found.' });
    }

    const project = rows[0];

    const [access] = await pool.query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, userId]
    );
    if (project.owner_id !== userId && !access.length) {
      return errorResponse(res, { statusCode: 403, message: 'You do not have access to this project.' });
    }

    const [members] = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar, pm.role, pm.joined_at
      FROM project_members pm JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `, [id]);

    const [taskStats] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM tasks WHERE project_id = ? GROUP BY status',
      [id]
    );

    return successResponse(res, {
      data: { project: { ...project, members, taskStats } },
    });
  } catch (err) { next(err); }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, start_date, end_date, color } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO projects 
        (name, description, status, priority, start_date, end_date, owner_id, color) 
       VALUES (?,?,?,?,?,?,?,?)`,
      [name, description || null, status || 'planning', priority || 'medium',
       start_date || null, end_date || null, userId, color || '#6366f1']
    );

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, userId, 'owner']
    );

    const [project] = await pool.query(
      'SELECT * FROM projects WHERE id = ?', [result.insertId]
    );

    return successResponse(res, {
      statusCode: 201,
      message: 'Project created successfully!',
      data: { project: project[0] },
    });
  } catch (err) { next(err); }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const userId     = req.user.id;
    const { name, description, status, priority, start_date, end_date, color } = req.body;

    const [rows] = await pool.query(
      'SELECT owner_id FROM projects WHERE id = ?', [id]
    );
    if (!rows.length) {
      return errorResponse(res, { statusCode: 404, message: 'Project not found.' });
    }
    if (rows[0].owner_id !== userId) {
      return errorResponse(res, { statusCode: 403, message: 'Only the project owner can edit.' });
    }

    await pool.query(
      `UPDATE projects 
       SET name=?, description=?, status=?, priority=?, start_date=?, end_date=?, color=? 
       WHERE id=?`,
      [name, description, status, priority, start_date || null, end_date || null, color, id]
    );

    const [updated] = await pool.query(
      'SELECT * FROM projects WHERE id = ?', [id]
    );

    return successResponse(res, {
      message: 'Project updated!',
      data: { project: updated[0] },
    });
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT owner_id FROM projects WHERE id = ?', [id]
    );
    if (!rows.length) {
      return errorResponse(res, { statusCode: 404, message: 'Project not found.' });
    }
    if (rows[0].owner_id !== userId) {
      return errorResponse(res, { statusCode: 403, message: 'Only the project owner can delete.' });
    }

    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return successResponse(res, { message: 'Project deleted successfully!' });
  } catch (err) { next(err); }
};

// POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { id }         = req.params;
    const { email, role = 'member' } = req.body;

    const [users] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ?', [email]
    );
    if (!users.length) {
      return errorResponse(res, { statusCode: 404, message: 'No user found with that email.' });
    }

    const user = users[0];
    const [exists] = await pool.query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, user.id]
    );
    if (exists.length) {
      return errorResponse(res, { statusCode: 409, message: 'User is already a project member.' });
    }

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?,?,?)',
      [id, user.id, role]
    );

    return successResponse(res, {
      statusCode: 201,
      message: 'Member added!',
      data: { user },
    });
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const { id, userId: memberId } = req.params;

    await pool.query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, memberId]
    );

    return successResponse(res, { message: 'Member removed.' });
  } catch (err) { next(err); }
};

module.exports = {
  getAllProjects, getStats, getProjectById,
  createProject, updateProject, deleteProject,
  addMember, removeMember,
};
const bcrypt                             = require('bcryptjs');
const { pool }                           = require('../config/db');
const { generateToken }                  = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const [exists] = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (exists.length) {
      return errorResponse(res, { statusCode: 409, message: 'Email is already registered.' });
    }

    const hashed  = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role || 'member']
    );

    const token = generateToken({ id: result.insertId });

    return successResponse(res, {
      statusCode: 201,
      message: 'Account created successfully!',
      data: {
        token,
        user: { id: result.insertId, name, email, role: role || 'member' },
      },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]
    );
    if (!rows.length) {
      return errorResponse(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    const user    = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id });
    const { password: _, ...safeUser } = user;

    return successResponse(res, {
      message: 'Login successful!',
      data: { token, user: safeUser },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    return successResponse(res, { data: { user: rows[0] } });
  } catch (err) { next(err); }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, bio = ? WHERE id = ?',
      [name, bio, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    return successResponse(res, { message: 'Profile updated!', data: { user: rows[0] } });
  } catch (err) { next(err); }
};

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [rows] = await pool.query(
      'SELECT password FROM users WHERE id = ?', [req.user.id]
    );

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return errorResponse(res, { statusCode: 400, message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]
    );

    return successResponse(res, { message: 'Password changed successfully!' });
  } catch (err) { next(err); }
};

// GET /api/auth/users
const searchUsers = async (req, res, next) => {
  try {
    const { search = '' } = req.query;

    const [rows] = await pool.query(
      `SELECT id, name, email, avatar, role 
       FROM users 
       WHERE is_active = 1 
       AND (name LIKE ? OR email LIKE ?) 
       LIMIT 20`,
      [`%${search}%`, `%${search}%`]
    );
    return successResponse(res, { data: { users: rows } });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, updateProfile, changePassword, searchUsers };
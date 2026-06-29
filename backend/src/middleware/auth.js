const { verifyToken }                    = require('../utils/jwt');
const { pool }                           = require('../config/db');
const { errorResponse }                  = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return errorResponse(res, { statusCode: 401, message: 'Access denied. Token not provided.' });
    }

    const token   = header.split(' ')[1];
    const decoded = verifyToken(token);

    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, bio FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );

    if (!rows.length) {
      return errorResponse(res, { statusCode: 401, message: 'User not found or deactivated.' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, { statusCode: 401, message: 'Token expired. Please login again.' });
    }
    return errorResponse(res, { statusCode: 401, message: 'Invalid token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return errorResponse(res, { statusCode: 403, message: 'Forbidden. Insufficient permissions.' });
  }
  next();
};

module.exports = { authenticate, authorize };
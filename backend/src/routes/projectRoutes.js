const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const {
  getAllProjects, getStats, getProjectById,
  createProject, updateProject, deleteProject,
  addMember, removeMember,
} = require('../controllers/projectController');

const { authenticate } = require('../middleware/auth');
const validate         = require('../middleware/validate');

// All routes protected
router.use(authenticate);

router.get('/stats', getStats);
router.get('/',      getAllProjects);
router.get('/:id',   getProjectById);

router.post('/', [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Project name required (2–200 chars)'),
  body('status').optional().isIn(['planning','active','on_hold','completed','cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low','medium','high','critical']).withMessage('Invalid priority'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color hex'),
], validate, createProject);

router.put('/:id', [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Project name required'),
  body('status').optional().isIn(['planning','active','on_hold','completed','cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low','medium','high','critical']).withMessage('Invalid priority'),
], validate, updateProject);

router.delete('/:id', deleteProject);

// Members
router.post('/:id/members', [
  body('email').isEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['manager','member','viewer']).withMessage('Invalid role'),
], validate, addMember);

router.delete('/:id/members/:userId', removeMember);

module.exports = router;
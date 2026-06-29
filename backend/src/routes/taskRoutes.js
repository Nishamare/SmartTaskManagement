const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const {
  getTasksByProject, getMyTasks, getTaskById,
  createTask, updateTask, updateTaskStatus, deleteTask,
  addComment, getNotifications, markAllRead,
} = require('../controllers/taskController');

const { authenticate } = require('../middleware/auth');
const validate         = require('../middleware/validate');

// All routes protected
router.use(authenticate);

// Special routes first (before /:id)
router.get('/my',                   getMyTasks);
router.get('/notifications',        getNotifications);
router.patch('/notifications/read', markAllRead);
router.get('/project/:projectId',   getTasksByProject);

router.post('/project/:projectId', [
  body('title').trim().isLength({ min: 2, max: 255 }).withMessage('Task title required (2–255 chars)'),
  body('status').optional().isIn(['todo','in_progress','in_review','done','cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low','medium','high','critical']).withMessage('Invalid priority'),
  body('estimated_hours').optional().isFloat({ min: 0 }).withMessage('Must be a positive number'),
], validate, createTask);

// Generic routes after
router.get('/:id',    getTaskById);
router.put('/:id',    updateTask);

router.patch('/:id/status', [
  body('status').isIn(['todo','in_progress','in_review','done','cancelled']).withMessage('Invalid status'),
], validate, updateTaskStatus);

router.delete('/:id', deleteTask);

router.post('/:id/comments', [
  body('comment').trim().notEmpty().withMessage('Comment cannot be empty'),
], validate, addComment);

module.exports = router;
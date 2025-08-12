import { Router, Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Get all published courses
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const db = await getDatabase();
    const courses = await db.query(`
      SELECT id, title, description, category, difficulty_level, estimated_duration, thumbnail_url, created_at
      FROM courses 
      WHERE is_published = true 
      ORDER BY created_at DESC
    `);

    res.json({ courses });

  } catch (error) {
    logger.error('Fetch courses error:', error);
    next(error);
  }
});

// Get course by ID with modules
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Get course details
    const courses = await db.query(`
      SELECT id, title, description, category, difficulty_level, estimated_duration, thumbnail_url, created_at
      FROM courses 
      WHERE id = ? AND is_published = true
    `, [id]);

    if (courses.length === 0) {
      return next(createError('Course not found', 404));
    }

    const course = courses[0];

    // Get course modules
    const modules = await db.query(`
      SELECT id, title, description, order_index, module_type, content, video_url, duration
      FROM course_modules 
      WHERE course_id = ? 
      ORDER BY order_index
    `, [id]);

    // Get quiz questions for quiz modules
    const quizModules = modules.filter((m: any) => m.module_type === 'quiz');
    for (const module of quizModules) {
      const questions = await db.query(`
        SELECT id, question_text, question_type, options, points, order_index
        FROM quiz_questions 
        WHERE module_id = ? 
        ORDER BY order_index
      `, [module.id]);
      module.questions = questions;
    }

    res.json({
      course: {
        ...course,
        modules
      }
    });

  } catch (error) {
    logger.error('Fetch course error:', error);
    next(error);
  }
});

// Enroll in a course
router.post('/:id/enroll', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      return next(createError('User not found', 404));
    }

    const { id: courseId } = req.params;
    const userId = req.user.id;
    const db = await getDatabase();

    // Check if course exists and is published
    const courses = await db.query(`
      SELECT id FROM courses WHERE id = ? AND is_published = true
    `, [courseId]);

    if (courses.length === 0) {
      return next(createError('Course not found', 404));
    }

    // Check if already enrolled
    const existingEnrollment = await db.query(`
      SELECT id FROM user_enrollments WHERE user_id = ? AND course_id = ?
    `, [userId, courseId]);

    if (existingEnrollment.length > 0) {
      return next(createError('Already enrolled in this course', 409));
    }

    // Enroll user
    await db.query(`
      INSERT INTO user_enrollments (id, user_id, course_id, progress_percentage)
      VALUES (?, ?, ?, ?)
    `, [require('uuid').v4(), userId, courseId, 0.00]);

    logger.info(`User ${userId} enrolled in course ${courseId}`);

    res.status(201).json({ 
      message: 'Successfully enrolled in course' 
    });

  } catch (error) {
    logger.error('Course enrollment error:', error);
    next(error);
  }
});

// Get user's enrolled courses
router.get('/enrolled/list', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      return next(createError('User not found', 404));
    }

    const userId = req.user.id;
    const db = await getDatabase();

    const enrolledCourses = await db.query(`
      SELECT 
        c.id, c.title, c.description, c.category, c.difficulty_level, c.estimated_duration, c.thumbnail_url,
        ue.enrolled_at, ue.progress_percentage, ue.completed_at
      FROM user_enrollments ue
      JOIN courses c ON ue.course_id = c.id
      WHERE ue.user_id = ?
      ORDER BY ue.enrolled_at DESC
    `, [userId]);

    res.json({ enrolledCourses });

  } catch (error) {
    logger.error('Fetch enrolled courses error:', error);
    next(error);
  }
});

// Update course progress
router.post('/:id/progress', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      return next(createError('User not found', 404));
    }

    const { id: courseId } = req.params;
    const { moduleId, status, timeSpent, score } = req.body;
    const userId = req.user.id;
    const db = await getDatabase();

    // Check if user is enrolled
    const enrollment = await db.query(`
      SELECT id FROM user_enrollments WHERE user_id = ? AND course_id = ?
    `, [userId, courseId]);

    if (enrollment.length === 0) {
      return next(createError('Not enrolled in this course', 403));
    }

    // Update or create progress record
    const existingProgress = await db.query(`
      SELECT id FROM user_progress WHERE user_id = ? AND module_id = ?
    `, [userId, moduleId]);

    if (existingProgress.length > 0) {
      // Update existing progress
      await db.query(`
        UPDATE user_progress 
        SET status = ?, time_spent = time_spent + ?, score = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND module_id = ?
      `, [status, timeSpent || 0, score, userId, moduleId]);
    } else {
      // Create new progress record
      await db.query(`
        INSERT INTO user_progress (id, user_id, module_id, status, started_at, time_spent, score)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
      `, [require('uuid').v4(), userId, moduleId, status, timeSpent || 0, score]);
    }

    // Calculate overall progress
    const totalModules = await db.query(`
      SELECT COUNT(*) as count FROM course_modules WHERE course_id = ?
    `, [courseId]);

    const completedModules = await db.query(`
      SELECT COUNT(*) as count 
      FROM user_progress up
      JOIN course_modules cm ON up.module_id = cm.id
      WHERE up.user_id = ? AND cm.course_id = ? AND up.status = 'completed'
    `, [userId, courseId]);

    const progressPercentage = (completedModules[0]?.count / totalModules[0]?.count) * 100;

    // Update enrollment progress
    await db.query(`
      UPDATE user_enrollments 
      SET progress_percentage = ?, current_module_id = ?
      WHERE user_id = ? AND course_id = ?
    `, [progressPercentage, moduleId, userId, courseId]);

    logger.info(`Progress updated for user ${userId} in course ${courseId}: ${progressPercentage}%`);

    res.json({ 
      message: 'Progress updated successfully',
      progressPercentage: Math.round(progressPercentage * 100) / 100
    });

  } catch (error) {
    logger.error('Update progress error:', error);
    next(error);
  }
});

// Get course progress
router.get('/:id/progress', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      return next(createError('User not found', 404));
    }

    const { id: courseId } = req.params;
    const userId = req.user.id;
    const db = await getDatabase();

    // Check if user is enrolled
    const enrollment = await db.query(`
      SELECT progress_percentage, current_module_id FROM user_enrollments WHERE user_id = ? AND course_id = ?
    `, [userId, courseId]);

    if (enrollment.length === 0) {
      return next(createError('Not enrolled in this course', 403));
    }

    // Get progress for all modules
    const moduleProgress = await db.query(`
      SELECT 
        cm.id, cm.title, cm.module_type, cm.order_index,
        up.status, up.time_spent, up.score, up.attempts
      FROM course_modules cm
      LEFT JOIN user_progress up ON cm.id = up.module_id AND up.user_id = ?
      WHERE cm.course_id = ?
      ORDER BY cm.order_index
    `, [userId, courseId]);

    res.json({
      progress: {
        overallPercentage: enrollment[0]?.progress_percentage || 0,
        currentModuleId: enrollment[0]?.current_module_id,
        modules: moduleProgress
      }
    });

  } catch (error) {
    logger.error('Fetch progress error:', error);
    next(error);
  }
});

export default router;

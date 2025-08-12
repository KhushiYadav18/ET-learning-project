import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Validation middleware
const validatePageView = [
  body('pageUrl').isURL(),
  body('pageTitle').optional().isString(),
  body('referrerUrl').optional().isURL(),
  body('userAgent').optional().isString(),
  body('timeOnPage').optional().isInt({ min: 0 })
];

const validateUserClick = [
  body('pageUrl').isURL(),
  body('elementId').optional().isString(),
  body('elementClass').optional().isString(),
  body('elementText').optional().isString(),
  body('clickCoordinates').optional().isObject()
];

const validateVideoInteraction = [
  body('moduleId').isUUID(),
  body('videoUrl').isURL(),
  body('actionType').isIn(['play', 'pause', 'seek', 'complete', 'stop']),
  body('videoTime').optional().isFloat({ min: 0 }),
  body('duration').optional().isFloat({ min: 0 })
];

const validateQuizAttempt = [
  body('moduleId').isUUID(),
  body('startedAt').optional().isISO8601(),
  body('completedAt').optional().isISO8601(),
  body('timeSpent').optional().isInt({ min: 0 }),
  body('score').optional().isFloat({ min: 0, max: 100 }),
  body('totalQuestions').optional().isInt({ min: 1 }),
  body('correctAnswers').optional().isInt({ min: 0 }),
  body('answers').optional().isObject()
];

// Track page view
router.post('/pageview', validatePageView, optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { 
          message: 'Validation failed', 
          details: errors.array() 
        } 
      });
    }

    const {
      pageUrl,
      pageTitle,
      referrerUrl,
      userAgent,
      timeOnPage
    } = req.body;

    const db = await getDatabase();
    const sessionId = req.headers['x-session-id'] as string || uuidv4();
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    await db.query(`
      INSERT INTO page_views (id, user_id, session_id, page_url, page_title, referrer_url, user_agent, ip_address, time_on_page)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuidv4(), userId, sessionId, pageUrl, pageTitle, referrerUrl, userAgent, ipAddress, timeOnPage]);

    logger.debug(`Page view tracked: ${pageUrl}`, { userId, sessionId });

    res.status(201).json({ 
      message: 'Page view tracked successfully',
      sessionId 
    });

  } catch (error) {
    logger.error('Page view tracking error:', error);
    next(error);
  }
});

// Track user click
router.post('/click', validateUserClick, optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { 
          message: 'Validation failed', 
          details: errors.array() 
        } 
      });
    }

    const {
      pageUrl,
      elementId,
      elementClass,
      elementText,
      clickCoordinates
    } = req.body;

    const db = await getDatabase();
    const sessionId = req.headers['x-session-id'] as string || uuidv4();
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    await db.query(`
      INSERT INTO user_clicks (id, user_id, session_id, page_url, element_id, element_class, element_text, click_coordinates, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuidv4(), userId, sessionId, pageUrl, elementId, elementClass, elementText, JSON.stringify(clickCoordinates), ipAddress]);

    logger.debug(`User click tracked: ${elementId || 'unknown'} on ${pageUrl}`, { userId, sessionId });

    res.status(201).json({ 
      message: 'Click tracked successfully',
      sessionId 
    });

  } catch (error) {
    logger.error('Click tracking error:', error);
    next(error);
  }
});

// Track video interaction
router.post('/video', validateVideoInteraction, optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { 
          message: 'Validation failed', 
          details: errors.array() 
        } 
      });
    }

    const {
      moduleId,
      videoUrl,
      actionType,
      videoTime,
      duration
    } = req.body;

    const db = await getDatabase();
    const sessionId = req.headers['x-session-id'] as string || uuidv4();
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    await db.query(`
      INSERT INTO video_interactions (id, user_id, session_id, module_id, video_url, action_type, video_time, duration, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuidv4(), userId, sessionId, moduleId, videoUrl, actionType, videoTime, duration, ipAddress]);

    logger.debug(`Video interaction tracked: ${actionType} on ${videoUrl}`, { userId, sessionId, moduleId });

    res.status(201).json({ 
      message: 'Video interaction tracked successfully',
      sessionId 
    });

  } catch (error) {
    logger.error('Video interaction tracking error:', error);
    next(error);
  }
});

// Track quiz attempt
router.post('/quiz', validateQuizAttempt, optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { 
          message: 'Validation failed', 
          details: errors.array() 
        } 
      });
    }

    const {
      moduleId,
      startedAt,
      completedAt,
      timeSpent,
      score,
      totalQuestions,
      correctAnswers,
      answers
    } = req.body;

    const db = await getDatabase();
    const sessionId = req.headers['x-session-id'] as string || uuidv4();
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    await db.query(`
      INSERT INTO quiz_attempts (id, user_id, module_id, session_id, started_at, completed_at, time_spent, score, total_questions, correct_answers, answers, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuidv4(), userId, moduleId, sessionId, startedAt, completedAt, timeSpent, score, totalQuestions, correctAnswers, JSON.stringify(answers), ipAddress]);

    logger.debug(`Quiz attempt tracked for module: ${moduleId}`, { userId, sessionId, score });

    res.status(201).json({ 
      message: 'Quiz attempt tracked successfully',
      sessionId 
    });

  } catch (error) {
    logger.error('Quiz attempt tracking error:', error);
    next(error);
  }
});

// Get analytics summary for authenticated user
router.get('/summary', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      return next(createError('Authentication required for analytics summary', 401));
    }

    const db = await getDatabase();
    const userId = req.user.id;

    // Get user's learning statistics
    const [pageViews, clicks, videoInteractions, quizAttempts] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM page_views WHERE user_id = ?', [userId]),
      db.query('SELECT COUNT(*) as count FROM user_clicks WHERE user_id = ?', [userId]),
      db.query('SELECT COUNT(*) as count FROM video_interactions WHERE user_id = ?', [userId]),
      db.query('SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?', [userId])
    ]);

    // Get recent activity
    const recentActivity = await db.query(`
      SELECT 'page_view' as type, page_url as url, timestamp, NULL as score
      FROM page_views 
      WHERE user_id = ? 
      UNION ALL
      SELECT 'quiz_attempt' as type, CONCAT('Quiz on module ', module_id) as url, completed_at as timestamp, score
      FROM quiz_attempts 
      WHERE user_id = ? AND completed_at IS NOT NULL
      ORDER BY timestamp DESC 
      LIMIT 10
    `, [userId, userId]);

    res.json({
      summary: {
        totalPageViews: pageViews[0]?.count || 0,
        totalClicks: clicks[0]?.count || 0,
        totalVideoInteractions: videoInteractions[0]?.count || 0,
        totalQuizAttempts: quizAttempts[0]?.count || 0
      },
      recentActivity
    });

  } catch (error) {
    logger.error('Analytics summary error:', error);
    next(error);
  }
});

export default router;

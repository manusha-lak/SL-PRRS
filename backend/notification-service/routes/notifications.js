// backend/notification-service/routes/notifications.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  createNotification,
  getUnreadByStation,
  markAsRead,
  getStats,
  getById
} = require('../db/database');

const router = express.Router();

const buildAutoMessage = ({ incident_type, location }) => {
  const incident = incident_type ? String(incident_type) : 'Incident';
  const loc = location ? String(location) : '';
  if (loc) return `New ${incident} report received at ${loc}`;
  return `New ${incident} report received`;
};

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management for police stations
 */

const createNotificationHandler = async (req, res) => {
  const {
    station_id,
    report_id,
    incident_type,
    location,
    message
  } = req.body || {};

  if (station_id === undefined || station_id === null || station_id === '') {
    return res.status(400).json({ error: 'station_id is required' });
  }

  const id = uuidv4();
  const finalMessage = message ? String(message) : buildAutoMessage({ incident_type, location });

  const notification = createNotification({
    id,
    station_id,
    report_id,
    incident_type,
    location,
    message: finalMessage
  });

  return res.status(201).json({
    message: 'Notification created successfully',
    notification
  });
};

const getUnreadByStationHandler = async (req, res) => {
  const { id } = req.params;
  const unread = getUnreadByStation(id);
  return res.status(200).json(unread);
};

const markAsReadHandler = async (req, res) => {
  const { id } = req.params;
  const existing = getById(id);
  if (!existing) return res.status(404).json({ error: 'Notification not found' });

  const updated = markAsRead(id);
  return res.status(200).json({
    message: 'Notification marked as read',
    notification: updated
  });
};

const getStatsHandler = async (req, res) => {
  const { stationId } = req.params;
  const stats = getStats(stationId);
  return res.status(200).json(stats);
};

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     description: Called internally by Report Service on new report creation.
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - station_id
 *               - incident_type
 *               - location
 *             properties:
 *               station_id:
 *                 oneOf:
 *                   - type: string
 *                   - type: integer
 *               report_id:
 *                 type: string
 *                 nullable: true
 *               incident_type:
 *                 type: string
 *               location:
 *                 type: string
 *               message:
 *                 type: string
 *                 nullable: true
 *           example:
 *             station_id: 12
 *             report_id: "rep_123"
 *             incident_type: "Theft"
 *             location: "Colombo 01"
 *     responses:
 *       201:
 *         description: Notification created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 notification:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/api/notifications', async (req, res) => {
  try {
    return await createNotificationHandler(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Alias for gateway-forwarded requests (proxy may strip `/api/notifications` prefix).
router.post('/', async (req, res) => {
  try {
    return await createNotificationHandler(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/notifications/station/{id}:
 *   get:
 *     summary: Get all unread notifications for a police station
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: integer
 *         description: Police station id
 *     responses:
 *       200:
 *         description: Unread notifications list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/api/notifications/station/:id', async (req, res) => {
  try {
    return await getUnreadByStationHandler(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Alias for gateway-forwarded requests (proxy may strip `/api/notifications` prefix).
router.get('/station/:id', async (req, res) => {
  try {
    return await getUnreadByStationHandler(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification id
 *     responses:
 *       200:
 *         description: Notification updated
 *       404:
 *         description: Notification not found
 */
router.put('/api/notifications/:id/read', async (req, res) => {
  try {
    return await markAsReadHandler(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Alias for gateway-forwarded requests (proxy may strip `/api/notifications` prefix).
router.put('/:id/read', async (req, res) => {
  try {
    return await markAsReadHandler(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/notifications/stats/{stationId}:
 *   get:
 *     summary: Get unread vs total notification counts for a dashboard
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: integer
 *     responses:
 *       200:
 *         description: Notification statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stationId:
 *                   type: string
 *                 unreadCount:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 */
router.get('/api/notifications/stats/:stationId', async (req, res) => {
  try {
    return await getStatsHandler(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Alias for gateway-forwarded requests (proxy may strip `/api/notifications` prefix).
router.get('/stats/:stationId', async (req, res) => {
  try {
    return await getStatsHandler(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;


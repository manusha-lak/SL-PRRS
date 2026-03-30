// backend/notification-service/db/database.js
// SQLite persistence layer for notifications.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'notifications.sqlite');

// Create the DB folder (and let better-sqlite3 create the DB file).
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL,
    report_id TEXT NULL,
    incident_type TEXT NULL,
    location TEXT NULL,
    message TEXT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    read_at TEXT NULL
  );
`);

const insertStmt = db.prepare(`
  INSERT INTO notifications (
    id, station_id, report_id, incident_type, location, message, is_read, created_at, read_at
  ) VALUES (
    @id, @station_id, @report_id, @incident_type, @location, @message, @is_read, @created_at, @read_at
  )
`);

const selectByIdStmt = db.prepare(`
  SELECT
    id,
    station_id,
    report_id,
    incident_type,
    location,
    message,
    is_read,
    created_at,
    read_at
  FROM notifications
  WHERE id = ?
`);

const selectUnreadByStationStmt = db.prepare(`
  SELECT
    id,
    station_id,
    report_id,
    incident_type,
    location,
    message,
    is_read,
    created_at,
    read_at
  FROM notifications
  WHERE station_id = ? AND is_read = 0
  ORDER BY created_at DESC
`);

const selectStatsStmt = db.prepare(`
  SELECT
    COUNT(*) AS totalCount,
    SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unreadCount
  FROM notifications
  WHERE station_id = ?
`);

const updateReadStmt = db.prepare(`
  UPDATE notifications
  SET is_read = 1,
      read_at = @read_at
  WHERE id = @id
`);

const createNotification = ({ id, station_id, report_id, incident_type, location, message }) => {
  const now = new Date().toISOString();

  insertStmt.run({
    id,
    station_id: String(station_id),
    report_id: report_id ?? null,
    incident_type: incident_type ?? null,
    location: location ?? null,
    message: message ?? null,
    is_read: 0,
    created_at: now,
    read_at: null
  });

  return selectByIdStmt.get(id);
};

const getUnreadByStation = (stationId) => {
  return selectUnreadByStationStmt.all(String(stationId));
};

const markAsRead = (id) => {
  const now = new Date().toISOString();
  const info = updateReadStmt.run({ id, read_at: now });
  if (info.changes === 0) return null;
  return selectByIdStmt.get(id);
};

const getStats = (stationId) => {
  const row = selectStatsStmt.get(String(stationId));
  const unreadCount = row?.unreadCount ?? 0;
  const totalCount = row?.totalCount ?? 0;
  return {
    stationId,
    unreadCount,
    totalCount
  };
};

const getById = (id) => {
  return selectByIdStmt.get(id) ?? null;
};

module.exports = {
  createNotification,
  getUnreadByStation,
  markAsRead,
  getStats,
  getById
};


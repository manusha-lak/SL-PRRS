const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const seedStations = require('../data/seedStations');

const dbDirectory = __dirname;
const dbPath = path.join(dbDirectory, 'stations.db');

fs.mkdirSync(dbDirectory, { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS stations (
    station_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    division TEXT,
    address TEXT NOT NULL,
    phone TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_stations_district ON stations(district);
  CREATE INDEX IF NOT EXISTS idx_stations_active ON stations(is_active);
`);

const stationCount = db.prepare('SELECT COUNT(*) AS count FROM stations').get().count;

if (stationCount === 0) {
  const insertStation = db.prepare(`
    INSERT INTO stations (
      station_id,
      name,
      district,
      division,
      address,
      phone,
      latitude,
      longitude,
      is_active
    ) VALUES (
      @station_id,
      @name,
      @district,
      @division,
      @address,
      @phone,
      @latitude,
      @longitude,
      @is_active
    )
  `);

  const insertMany = db.transaction((stations) => {
    stations.forEach((station) => insertStation.run(station));
  });

  insertMany(seedStations);
}

module.exports = db;

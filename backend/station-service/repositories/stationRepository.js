const db = require('../db/database');

const buildFilters = ({ district, division, active }) => {
  const conditions = [];
  const params = [];

  if (district) {
    conditions.push('LOWER(district) = LOWER(?)');
    params.push(district);
  }

  if (division) {
    conditions.push('LOWER(division) = LOWER(?)');
    params.push(division);
  }

  if (typeof active === 'number') {
    conditions.push('is_active = ?');
    params.push(active);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  return { whereClause, params };
};

const mapStation = (row) => {
  if (!row) return null;

  return {
    ...row,
    is_active: Boolean(row.is_active),
  };
};

const getAllStations = (filters = {}) => {
  const { whereClause, params } = buildFilters(filters);
  const rows = db
    .prepare(`
      SELECT
        station_id,
        name,
        district,
        division,
        address,
        phone,
        latitude,
        longitude,
        is_active,
        created_at,
        updated_at
      FROM stations
      ${whereClause}
      ORDER BY district ASC, name ASC
    `)
    .all(...params);

  return rows.map(mapStation);
};

const getStationById = (stationId) => {
  const row = db
    .prepare(`
      SELECT
        station_id,
        name,
        district,
        division,
        address,
        phone,
        latitude,
        longitude,
        is_active,
        created_at,
        updated_at
      FROM stations
      WHERE station_id = ?
    `)
    .get(stationId);

  return mapStation(row);
};

const createStation = (station) => {
  db.prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    station.station_id,
    station.name,
    station.district,
    station.division || null,
    station.address,
    station.phone || null,
    station.latitude,
    station.longitude,
    station.is_active
  );

  return getStationById(station.station_id);
};

const updateStation = (stationId, station) => {
  db.prepare(`
    UPDATE stations
    SET
      name = ?,
      district = ?,
      division = ?,
      address = ?,
      phone = ?,
      latitude = ?,
      longitude = ?,
      is_active = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE station_id = ?
  `).run(
    station.name,
    station.district,
    station.division || null,
    station.address,
    station.phone || null,
    station.latitude,
    station.longitude,
    station.is_active,
    stationId
  );

  return getStationById(stationId);
};

module.exports = {
  createStation,
  getAllStations,
  getStationById,
  updateStation,
};

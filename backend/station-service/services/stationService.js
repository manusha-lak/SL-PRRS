const { getDistance } = require('geolib');

const stationRepository = require('../repositories/stationRepository');
const {
  createError,
  validateCoordinates,
  validateListQuery,
  validateNearbyQuery,
  validateStationId,
  validateStationPayload,
} = require('../validators/stationValidator');

const listStations = (query) => {
  const filters = validateListQuery(query);
  return stationRepository.getAllStations(filters);
};

const getStationById = (stationId) => {
  const validId = validateStationId(stationId);
  const station = stationRepository.getStationById(validId);

  if (!station) {
    throw createError(404, 'Station not found');
  }

  return station;
};

const validateStation = (stationId) => {
  const station = getStationById(stationId);

  return {
    station_id: station.station_id,
    exists: true,
    is_active: station.is_active,
    station_name: station.name,
  };
};

const getNearbyStations = (query) => {
  const filters = validateNearbyQuery(query);
  const stations = stationRepository.getAllStations({
    district: filters.district,
    active: 1,
  });

  const withDistance = stations
    .map((station) => {
      const distanceMeters = getDistance(
        { latitude: filters.latitude, longitude: filters.longitude },
        { latitude: station.latitude, longitude: station.longitude }
      );

      return {
        ...station,
        distanceKm: Number((distanceMeters / 1000).toFixed(2)),
      };
    })
    .filter((station) => {
      if (filters.radiusKm === undefined) {
        return true;
      }

      return station.distanceKm <= filters.radiusKm;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (filters.limit) {
    return withDistance.slice(0, filters.limit);
  }

  return withDistance;
};

const createStation = (payload) => {
  const data = validateStationPayload(payload);
  const existing = stationRepository.getStationById(data.station_id);

  if (existing) {
    throw createError(409, 'Station already exists', [
      `A station with station_id ${data.station_id} already exists`,
    ]);
  }

  return stationRepository.createStation(data);
};

const updateStation = (stationId, payload) => {
  const validStationId = validateStationId(stationId);
  const existing = stationRepository.getStationById(validStationId);

  if (!existing) {
    throw createError(404, 'Station not found');
  }

  const updates = validateStationPayload(payload, { partial: true });
  const definedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const merged = {
    ...existing,
    ...definedUpdates,
    station_id: validStationId,
    is_active:
      definedUpdates.is_active !== undefined
        ? definedUpdates.is_active
        : existing.is_active
          ? 1
          : 0,
  };

  validateCoordinates(merged.latitude, merged.longitude);

  return stationRepository.updateStation(validStationId, merged);
};

module.exports = {
  createStation,
  getNearbyStations,
  getStationById,
  listStations,
  updateStation,
  validateStation,
};

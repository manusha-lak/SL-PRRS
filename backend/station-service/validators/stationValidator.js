const createError = (status, message, details) => {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
};

const STATION_ID_PATTERN = /^STN_[A-Z0-9_]+$/;

const parseBooleanQuery = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (value === 'true' || value === '1') return 1;
  if (value === 'false' || value === '0') return 0;
  throw createError(400, 'Validation failed', [`${fieldName} must be true, false, 1, or 0`]);
};

const parseNumber = (value, fieldName) => {
  const number = Number(value);
  if (Number.isNaN(number)) {
    throw createError(400, 'Validation failed', [`${fieldName} must be a valid number`]);
  }
  return number;
};

const validateCoordinates = (latitude, longitude) => {
  const errors = [];

  if (latitude < -90 || latitude > 90) {
    errors.push('latitude must be between -90 and 90');
  }

  if (longitude < -180 || longitude > 180) {
    errors.push('longitude must be between -180 and 180');
  }

  if (errors.length) {
    throw createError(400, 'Validation failed', errors);
  }
};

const validateStationId = (stationId) => {
  if (!stationId || !STATION_ID_PATTERN.test(stationId)) {
    throw createError(400, 'Validation failed', [
      'stationId must match the format STN_<CODE>',
    ]);
  }

  return stationId;
};

const validateListQuery = (query) => ({
  district: query.district ? String(query.district).trim() : undefined,
  division: query.division ? String(query.division).trim() : undefined,
  active: parseBooleanQuery(query.active, 'active'),
});

const validateNearbyQuery = (query) => {
  const errors = [];

  if (query.lat === undefined) errors.push('lat is required');
  if (query.lng === undefined) errors.push('lng is required');

  if (errors.length) {
    throw createError(400, 'Validation failed', errors);
  }

  const latitude = parseNumber(query.lat, 'lat');
  const longitude = parseNumber(query.lng, 'lng');
  validateCoordinates(latitude, longitude);

  let radiusKm;
  if (query.radiusKm !== undefined) {
    radiusKm = parseNumber(query.radiusKm, 'radiusKm');
    if (radiusKm <= 0) {
      throw createError(400, 'Validation failed', ['radiusKm must be greater than 0']);
    }
  }

  let limit;
  if (query.limit !== undefined) {
    limit = parseNumber(query.limit, 'limit');
    if (!Number.isInteger(limit) || limit <= 0) {
      throw createError(400, 'Validation failed', ['limit must be a positive integer']);
    }
  }

  return {
    latitude,
    longitude,
    radiusKm,
    limit,
    district: query.district ? String(query.district).trim() : undefined,
  };
};

const validateStationPayload = (payload, { partial = false } = {}) => {
  const errors = [];
  const normalized = {
    station_id: payload.station_id ? String(payload.station_id).trim().toUpperCase() : undefined,
    name: payload.name ? String(payload.name).trim() : undefined,
    district: payload.district ? String(payload.district).trim() : undefined,
    division: payload.division ? String(payload.division).trim() : undefined,
    address: payload.address ? String(payload.address).trim() : undefined,
    phone: payload.phone ? String(payload.phone).trim() : undefined,
    latitude: payload.latitude,
    longitude: payload.longitude,
    is_active: payload.is_active,
  };

  const requiredFields = partial
    ? []
    : ['station_id', 'name', 'district', 'address', 'latitude', 'longitude'];

  const providedFields = Object.entries(normalized).filter(
    ([key, value]) => key !== 'station_id' && value !== undefined && value !== ''
  );

  if (partial && providedFields.length === 0) {
    errors.push('At least one updatable field is required');
  }

  requiredFields.forEach((field) => {
    if (normalized[field] === undefined || normalized[field] === '') {
      errors.push(`${field} is required`);
    }
  });

  if (normalized.station_id && !STATION_ID_PATTERN.test(normalized.station_id)) {
    errors.push('station_id must match the format STN_<CODE>');
  }

  if (normalized.latitude !== undefined) {
    normalized.latitude = parseNumber(normalized.latitude, 'latitude');
  }

  if (normalized.longitude !== undefined) {
    normalized.longitude = parseNumber(normalized.longitude, 'longitude');
  }

  if (normalized.latitude !== undefined && normalized.longitude !== undefined) {
    validateCoordinates(normalized.latitude, normalized.longitude);
  }

  if (normalized.is_active !== undefined) {
    if (typeof normalized.is_active === 'boolean') {
      normalized.is_active = normalized.is_active ? 1 : 0;
    } else if (normalized.is_active === 1 || normalized.is_active === 0) {
      normalized.is_active = normalized.is_active;
    } else if (normalized.is_active === 'true' || normalized.is_active === '1') {
      normalized.is_active = 1;
    } else if (normalized.is_active === 'false' || normalized.is_active === '0') {
      normalized.is_active = 0;
    } else {
      errors.push('is_active must be true, false, 1, or 0');
    }
  } else if (!partial) {
    normalized.is_active = 1;
  }

  if (errors.length) {
    throw createError(400, 'Validation failed', errors);
  }

  return normalized;
};

module.exports = {
  createError,
  validateCoordinates,
  validateListQuery,
  validateNearbyQuery,
  validateStationId,
  validateStationPayload,
};

const stationService = require('../services/stationService');

const healthCheck = (req, res) => {
  res.json({
    success: true,
    message: 'Station Service is healthy',
    data: {
      service: 'station-service',
      status: 'UP',
    },
  });
};

const listStations = (req, res, next) => {
  try {
    const stations = stationService.listStations(req.query);
    res.json({
      success: true,
      message: 'Stations retrieved successfully',
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};

const getStationById = (req, res, next) => {
  try {
    const station = stationService.getStationById(req.params.stationId);
    res.json({
      success: true,
      message: 'Station retrieved successfully',
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

const getNearbyStations = (req, res, next) => {
  try {
    const stations = stationService.getNearbyStations(req.query);
    res.json({
      success: true,
      message: 'Nearby stations retrieved successfully',
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};

const validateStation = (req, res, next) => {
  try {
    const result = stationService.validateStation(req.params.stationId);
    res.json({
      success: true,
      message: 'Station validation completed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createStation = (req, res, next) => {
  try {
    const station = stationService.createStation(req.body);
    res.status(201).json({
      success: true,
      message: 'Station created successfully',
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

const updateStation = (req, res, next) => {
  try {
    const station = stationService.updateStation(req.params.stationId, req.body);
    res.json({
      success: true,
      message: 'Station updated successfully',
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStation,
  getNearbyStations,
  getStationById,
  healthCheck,
  listStations,
  updateStation,
  validateStation,
};

const express = require('express');

const stationController = require('../controllers/stationController');

const router = express.Router();

router.get('/health', stationController.healthCheck);
router.get('/nearby', stationController.getNearbyStations);
router.get('/:stationId/validate', stationController.validateStation);
router.get('/:stationId', stationController.getStationById);
router.get('/', stationController.listStations);
router.post('/', stationController.createStation);
router.put('/:stationId', stationController.updateStation);

module.exports = router;

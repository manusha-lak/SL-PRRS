const express = require('express');
const router = express.Router();

const caseController = require('../controllers/caseController');
const { validateUpdateStatusRequest } = require('../validators/caseValidators');

// GET /api/cases/:reportId - get case timeline
router.get('/:reportId', caseController.getCaseTimeline);

// GET /api/cases/track/:referenceCode - track case by reference code
router.get('/track/:referenceCode', caseController.trackCaseByReference);

// PUT /api/cases/:reportId/status - update case status
router.put('/:reportId/status', validateUpdateStatusRequest, caseController.updateCaseStatus);

// GET /api/cases/station/:stationId - get station cases
router.get('/station/:stationId', caseController.getCasesForStation);

// GET /api/cases/health - health check
router.get('/health', caseController.healthCheck);

module.exports = router;

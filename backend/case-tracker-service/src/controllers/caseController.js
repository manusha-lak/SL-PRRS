const caseService = require('../services/caseService');

async function getCaseTimeline(req, res, next) {
  try {
    const { reportId } = req.params;
    const { case: caseRow, history } = await caseService.getCaseTimeline(reportId);

    if (!caseRow) {
      return res.status(404).json({
        success: false,
        message: 'Case not found for given reportId',
      });
    }

    return res.json({
      success: true,
      message: 'Case timeline fetched successfully',
      data: {
        case: caseRow,
        history,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function trackCaseByReference(req, res, next) {
  try {
    const { referenceCode } = req.params;
    const { case: caseRow, history } = await caseService.getCaseByReference(referenceCode);

    if (!caseRow) {
      return res.status(404).json({
        success: false,
        message: 'Case not found for given reference code',
      });
    }

    return res.json({
      success: true,
      message: 'Case fetched successfully by reference code',
      data: {
        case: caseRow,
        history,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateCaseStatus(req, res, next) {
  try {
    const { reportId } = req.params;
    const { status, officer_note: officerNote, updated_by: updatedBy } = req.body;

    const caseRow = await caseService.updateStatus({
      reportId,
      status,
      officerNote,
      updatedBy,
    });

    if (!caseRow) {
      return res.status(404).json({
        success: false,
        message: 'Case not found for given reportId',
      });
    }

    return res.json({
      success: true,
      message: 'Case status updated successfully',
      data: caseRow,
    });
  } catch (err) {
    next(err);
  }
}

async function getCasesForStation(req, res, next) {
  try {
    const { stationId } = req.params;
    const cases = await caseService.getCasesForStation(stationId);

    return res.json({
      success: true,
      message: 'Cases fetched successfully for station',
      data: cases,
    });
  } catch (err) {
    next(err);
  }
}

async function healthCheck(req, res) {
  return res.json({
    success: true,
    message: 'Case Service is healthy',
  });
}

module.exports = {
  getCaseTimeline,
  trackCaseByReference,
  updateCaseStatus,
  getCasesForStation,
  healthCheck,
};

const caseRepository = require('../repositories/caseRepository');

const VALID_STATUSES = ['PENDING', 'RECEIVED', 'INVESTIGATING', 'RESOLVED'];

function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

async function getCaseTimeline(reportId) {
  const [caseRow, history] = await Promise.all([
    caseRepository.getCaseByReportId(reportId),
    caseRepository.getCaseTimelineByReportId(reportId),
  ]);

  return { case: caseRow, history };
}

async function getCaseByReference(referenceCode) {
  const [caseRow, history] = await Promise.all([
    caseRepository.getCaseByReferenceCode(referenceCode),
    caseRepository.getCaseTimelineByReferenceCode(referenceCode),
  ]);

  return { case: caseRow, history };
}

async function getCasesForStation(stationId) {
  return caseRepository.getCasesByStationId(stationId);
}

async function createInitialCase({ reportId, stationId, referenceCode, status = 'PENDING', officerNote, updatedBy }) {
  if (!isValidStatus(status)) {
    const error = new Error('Invalid status');
    error.statusCode = 400;
    throw error;
  }

  return caseRepository.createInitialCase({
    reportId,
    stationId,
    referenceCode,
    status,
    officerNote,
    updatedBy,
  });
}

async function updateStatus({ reportId, status, officerNote, updatedBy }) {
  if (!isValidStatus(status)) {
    const error = new Error('Invalid status');
    error.statusCode = 400;
    throw error;
  }

  const caseRow = await caseRepository.updateCaseStatus({
    reportId,
    status,
    officerNote,
    updatedBy,
  });

  return caseRow;
}

module.exports = {
  VALID_STATUSES,
  isValidStatus,
  getCaseTimeline,
  getCaseByReference,
  getCasesForStation,
  createInitialCase,
  updateStatus,
};

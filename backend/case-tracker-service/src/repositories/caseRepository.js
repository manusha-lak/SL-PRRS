const supabase = require('../db/supabase');

// Assumes tables: cases, case_history

async function getCaseTimelineByReportId(reportId) {
  const { data, error } = await supabase
    .from('case_history')
    .select('*')
    .eq('report_id', reportId)
    .order('updated_at', { ascending: true });

  if (error) throw error;
  return data;
}

async function getCaseByReportId(reportId) {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('report_id', reportId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getCaseByReferenceCode(referenceCode) {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('reference_code', referenceCode)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getCaseTimelineByReferenceCode(referenceCode) {
  const { data, error } = await supabase
    .from('case_history')
    .select('*')
    .eq('reference_code', referenceCode)
    .order('updated_at', { ascending: true });

  if (error) throw error;
  return data;
}

async function getCasesByStationId(stationId) {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('station_id', stationId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function createInitialCase({ reportId, stationId, referenceCode, status, officerNote, updatedBy }) {
  const now = new Date().toISOString();

  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .insert([
      {
        report_id: reportId,
        station_id: stationId,
        reference_code: referenceCode,
        current_status: status,
        officer_note: officerNote || null,
        updated_by: updatedBy || null,
        updated_at: now,
      },
    ])
    .select()
    .maybeSingle();

  if (caseError) throw caseError;

  const { error: historyError } = await supabase
    .from('case_history')
    .insert([
      {
        report_id: reportId,
        station_id: stationId,
        reference_code: referenceCode,
        status,
        officer_note: officerNote || null,
        updated_by: updatedBy || null,
        updated_at: now,
      },
    ]);

  if (historyError) throw historyError;

  return caseRow;
}

async function updateCaseStatus({ reportId, status, officerNote, updatedBy }) {
  const now = new Date().toISOString();

  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .update({
      current_status: status,
      officer_note: officerNote || null,
      updated_by: updatedBy || null,
      updated_at: now,
    })
    .eq('report_id', reportId)
    .select()
    .maybeSingle();

  if (caseError) throw caseError;
  if (!caseRow) return null;

  const { error: historyError } = await supabase
    .from('case_history')
    .insert([
      {
        report_id: caseRow.report_id,
        station_id: caseRow.station_id,
        reference_code: caseRow.reference_code,
        status,
        officer_note: officerNote || null,
        updated_by: updatedBy || null,
        updated_at: now,
      },
    ]);

  if (historyError) throw historyError;

  return caseRow;
}

module.exports = {
  getCaseTimelineByReportId,
  getCaseByReportId,
  getCaseByReferenceCode,
  getCaseTimelineByReferenceCode,
  getCasesByStationId,
  createInitialCase,
  updateCaseStatus,
};

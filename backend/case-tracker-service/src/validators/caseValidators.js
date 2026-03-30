const { VALID_STATUSES } = require('../services/caseService');

function validateUpdateStatusRequest(req, res, next) {
  const { status, officer_note, updated_by } = req.body;

  const errors = [];

  if (!status) {
    errors.push('status is required');
  } else if (!VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (updated_by && typeof updated_by !== 'string') {
    errors.push('updated_by must be a string if provided');
  }

  if (officer_note && typeof officer_note !== 'string') {
    errors.push('officer_note must be a string if provided');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

module.exports = {
  validateUpdateStatusRequest,
};

const { sql, getPool } = require('../config/database');

const businessErrors = new Map([
  [50001, { status: 404, code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' }],
  [50002, { status: 404, code: 'SLOT_NOT_FOUND', message: 'Appointment slot not found.' }],
  [50003, { status: 409, code: 'SLOT_ALREADY_BOOKED', message: 'Appointment slot is already booked.' }]
]);

/** Executes the sole database write path for a booking and maps expected business errors. */
async function bookAppointment({ slotId, patientId }) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('SlotId', sql.Int, slotId)
      .input('PatientId', sql.Int, patientId)
      .execute('dbo.BookAppointment');
    return result.recordset[0];
  } catch (error) {
    const mapped = businessErrors.get(error.number);
    if (mapped) throw Object.assign(new Error(mapped.message), mapped);
    throw error;
  }
}

module.exports = { bookAppointment };

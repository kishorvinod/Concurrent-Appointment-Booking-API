const express = require('express');
const { bookAppointment } = require('../services/booking-service');

const router = express.Router();

/** Determines whether a request value is a positive integer. */
function validPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

/**
 * @openapi
 * /api/appointments/book:
 *   post:
 *     summary: Book an available appointment slot
 *     description: Atomically books one existing slot for one existing patient. Concurrent attempts for the same slot result in one success and conflicts for all other callers.
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slotId, patientId]
 *             properties:
 *               slotId: { type: integer, minimum: 1, example: 101 }
 *               patientId: { type: integer, minimum: 1, example: 5001 }
 *     responses:
 *       201: { description: Appointment created }
 *       400: { description: Invalid request body }
 *       404: { description: Patient or slot does not exist }
 *       409: { description: Slot has already been booked }
 *       500: { description: Unexpected server error }
 */
router.post('/book', async (req, res, next) => {
  const { slotId, patientId } = req.body || {};
  if (!validPositiveInteger(slotId) || !validPositiveInteger(patientId)) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'slotId and patientId must be positive integers.' }
    });
  }

  try {
    const appointment = await bookAppointment({ slotId, patientId });
    return res.status(201).json({ appointment });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

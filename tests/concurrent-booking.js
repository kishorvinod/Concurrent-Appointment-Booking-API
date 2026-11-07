require('dotenv').config();
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { getPool, closePool, requiredEnvironment } = require('../src/config/database');

const baseUrl = requiredEnvironment('API_BASE_URL');

/** Resets the seeded test slot, executes 20 simultaneous requests, and verifies persisted state. */
async function run() {
  const pool = await getPool();
  await pool.request().query("DELETE FROM dbo.Appointments WHERE SlotId = 101; UPDATE dbo.AppointmentSlots SET Status = 'Available' WHERE SlotId = 101;");
  const responses = await Promise.all(Array.from({ length: 20 }, async (_, index) => {
    const response = await fetch(`${baseUrl}/api/appointments/book`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slotId: 101, patientId: 5001 + index })
    });
    return { status: response.status, body: await response.json() };
  }));
  const created = responses.filter(({ status }) => status === 201);
  const conflicts = responses.filter(({ status }) => status === 409);
  const database = await pool.request().query('SELECT COUNT(*) AS count FROM dbo.Appointments WHERE SlotId = 101; SELECT Status FROM dbo.AppointmentSlots WHERE SlotId = 101;');
  assert.equal(created.length, 1, 'Exactly one request must succeed');
  assert.equal(conflicts.length, 19, 'All other requests must conflict');
  assert.equal(database.recordsets[0][0].count, 1, 'Exactly one appointment must exist');
  assert.equal(database.recordsets[1][0].Status, 'Booked', 'Slot must be booked');
  const result = {
    executedAt: new Date().toISOString(),
    requests: 20,
    created: created.length,
    conflicts: conflicts.length,
    appointmentsForSlot101: database.recordsets[0][0].count,
    slotStatus: database.recordsets[1][0].Status
  };
  const resultDirectory = path.join(__dirname, '..', 'test-results');
  const resultFile = path.join(resultDirectory, 'concurrent-result.json');
  await fs.mkdir(resultDirectory, { recursive: true });
  await fs.writeFile(resultFile, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ ...result, resultFile }, null, 2));
}

run().catch(error => { console.error(error); process.exitCode = 1; }).finally(closePool);

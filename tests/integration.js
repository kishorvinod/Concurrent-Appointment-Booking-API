require('dotenv').config();
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');
const { getPool, closePool, requiredEnvironment, requiredPort } = require('../src/config/database');

const baseUrl = requiredEnvironment('API_BASE_URL');

/** Starts the real Express application for HTTP-level integration tests. */
function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(requiredPort('PORT'), () => resolve(server));
    server.once('error', reject);
  });
}

/** Sends one JSON booking request to the running application. */
async function book(body) {
  const response = await fetch(`${baseUrl}/api/appointments/book`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
}

/** Restores one seeded slot to its clean, available state. */
async function resetSlot(pool, slotId) {
  await pool.request().input('slotId', slotId).query(
    "DELETE FROM dbo.Appointments WHERE SlotId = @slotId; UPDATE dbo.AppointmentSlots SET Status = 'Available' WHERE SlotId = @slotId;"
  );
}

/** Runs a named test and stores its successful outcome for the final report. */
async function test(name, callback, results) {
  const details = await callback();
  results.push({ name, result: 'passed', ...(details ? { details } : {}) });
}

/** Saves the completed test result as a submission-ready JSON artifact. */
async function saveResults(results) {
  const resultDirectory = path.join(__dirname, '..', 'test-results');
  const resultFile = path.join(resultDirectory, 'integration-result.json');
  await fs.mkdir(resultDirectory, { recursive: true });
  await fs.writeFile(resultFile, `${JSON.stringify({ executedAt: new Date().toISOString(), total: results.length, results }, null, 2)}\n`);
  return resultFile;
}

/** Executes functional, failure, rollback, and concurrency tests against SQL Server. */
async function run() {
  const server = await startServer();
  const pool = await getPool();
  const results = [];
  try {
    await test('Serves OpenAPI Swagger UI generated from route annotations', async () => {
      assert.equal((await fetch(`${baseUrl}/api-docs`)).status, 200);
    }, results);

    await test('Rejects missing or invalid request IDs', async () => {
      assert.equal((await book({ slotId: 101, patientId: 'not-an-id' })).status, 400);
    }, results);

    await test('Reports an unknown patient and does not book the slot', async () => {
      await resetSlot(pool, 101);
      assert.equal((await book({ slotId: 101, patientId: 999999 })).status, 404);
      assert.equal((await pool.request().query("SELECT Status FROM dbo.AppointmentSlots WHERE SlotId = 101;")).recordset[0].Status, 'Available');
    }, results);

    await test('Reports an unknown slot', async () => {
      assert.equal((await book({ slotId: 999999, patientId: 5001 })).status, 404);
    }, results);

    await test('Creates one booking and rejects a sequential duplicate', async () => {
      await resetSlot(pool, 101);
      assert.equal((await book({ slotId: 101, patientId: 5001 })).status, 201);
      assert.equal((await book({ slotId: 101, patientId: 5002 })).status, 409);
    }, results);

    await test('Rolls back a claimed slot when the appointment insert fails', async () => {
      await resetSlot(pool, 102);
      await pool.request().query("INSERT dbo.Appointments (SlotId, PatientId) VALUES (102, 5001); UPDATE dbo.AppointmentSlots SET Status = 'Available' WHERE SlotId = 102;");
      assert.equal((await book({ slotId: 102, patientId: 5002 })).status, 500);
      assert.equal((await pool.request().query("SELECT Status FROM dbo.AppointmentSlots WHERE SlotId = 102;")).recordset[0].Status, 'Available');
      await resetSlot(pool, 102);
    }, results);

    await test('Allows exactly one of 20 simultaneous requests', async () => {
      await resetSlot(pool, 101);
      const responses = await Promise.all(Array.from({ length: 20 }, (_, index) => book({ slotId: 101, patientId: 5001 + index })));
      assert.equal(responses.filter(response => response.status === 201).length, 1);
      assert.equal(responses.filter(response => response.status === 409).length, 19);
      const appointmentsForSlot = (await pool.request().query('SELECT COUNT(*) AS count FROM dbo.Appointments WHERE SlotId = 101;')).recordset[0].count;
      assert.equal(appointmentsForSlot, 1);
      return { requests: 20, created: 1, conflicts: 19, appointmentsForSlot101: appointmentsForSlot };
    }, results);

    const resultFile = await saveResults(results);
    console.log(JSON.stringify({ total: results.length, results, resultFile }, null, 2));
  } finally {
    server.close();
    await closePool();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });

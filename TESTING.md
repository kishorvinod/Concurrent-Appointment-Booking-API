# End-to-end testing and actual results

## Run the complete suite

Ensure the database is created with `npm run db:setup`, then run:

```powershell
npm run test:integration
```

The command starts the Express application in-process, executes HTTP requests against the configured `API_BASE_URL`, checks persisted SQL Server data where required, then stops the server. No API process is left running.

## Test cases

| Test | Expected assertion |
| --- | --- |
| Swagger availability | `/api-docs` returns `200`. |
| Request validation | Invalid ID input returns `400`. |
| Unknown patient | Returns `404`; the slot remains `Available`. |
| Unknown slot | Returns `404`. |
| Sequential duplicate | First booking returns `201`; repeat returns `409`. |
| Rollback on database failure | A deliberately forced unique-key failure returns `500` and leaves the claimed slot `Available`. |
| Simultaneous requests | Twenty requests for one slot produce one `201`, nineteen `409`, and exactly one database appointment. |

## Actual test execution results

Every successful complete run writes the exact result to [test-results/integration-result.json](test-results/integration-result.json). This JSON file is the submission-ready evidence of execution; it contains the UTC timestamp, total number of tests, individual pass/fail result, and numeric details for the concurrent-request case.

The console also prints the same summary and the artifact path. Keep the generated JSON file in the final submission.

The standalone `npm run test:concurrent` command provides a focused 20-request test when the API is already running. It saves its exact result to [test-results/concurrent-result.json](test-results/concurrent-result.json), including request count, successes, conflicts, appointment count, and final slot status.

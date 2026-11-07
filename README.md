# Concurrent Appointment Booking API

A Node.js, Express, and Microsoft SQL Server REST API for safely booking doctor appointment slots. It is a technical assessment focused on preventing two simultaneous requests from booking the same slot.

## Features

- `POST /api/appointments/book` with request validation and meaningful HTTP responses.
- SQL Server stored procedure with atomic slot claiming, transactions, rollback, and a unique constraint.
- Request IDs and structured request logs.
- Configurable CORS and IP-based rate limiting.
- OpenAPI Swagger UI at `/api-docs`, documented beside the route source.
- A complete live integration suite; actual results are written to `test-results/integration-result.json`.

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop with the `mcr.microsoft.com/mssql/server:2022-latest` image, or a reachable SQL Server 2022 instance

## Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env`, then set values appropriate for your SQL Server. Every runtime setting is required; no connection defaults are embedded in application source.

3. Start SQL Server with Docker if needed:

   ```powershell
   docker run --detach --name appointment-booking-sql --publish 14333:1433 --env ACCEPT_EULA=Y --env MSSQL_SA_PASSWORD="ChangeThis!12345" mcr.microsoft.com/mssql/server:2022-latest
   ```

   Use a strong, non-example password outside local development. With this command, set `DB_PORT=14333` in `.env`.

4. Create the database and apply all scripts:

   ```powershell
   npm run db:setup
   ```

5. Start the API:

   ```powershell
   npm start
   ```

6. Browse Swagger UI at `http://localhost:3000/api-docs` (or the host and port configured in `API_BASE_URL`).

## Configuration

See `.env.example` for all required variables:

- `PORT`, `API_BASE_URL`
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
- `DB_SERVER`, `DB_PORT`, `DB_ADMIN_NAME`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `DB_ENCRYPT`, `DB_TRUST_SERVER_CERTIFICATE`

## Commands

| Command | Purpose |
| --- | --- |
| `npm run db:setup` | Creates the configured database and applies schema, seed, and procedure scripts. Run once on a fresh database. |
| `npm start` | Starts the API. |
| `npm run test:integration` | Starts an in-process API, runs all live end-to-end tests, stops it, and writes the result artifact. |
| `npm run test:concurrent` | Runs only the 20-request concurrency test; start the API separately first. |

## Submission documents

- [DATABASE.md](DATABASE.md): SQL Server schema and seed details
- [API-IMPLEMENTATION.md](API-IMPLEMENTATION.md): endpoint, Swagger, security middleware, and example request
- [TESTING.md](TESTING.md): test cases and actual result artifact location
- [CONCURRENCY-EXPLANATION.md](CONCURRENCY-EXPLANATION.md): why simultaneous bookings cannot both succeed

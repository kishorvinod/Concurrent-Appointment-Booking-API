# MSSQL database creation and sample data

`npm run db:setup` connects using `.env`, creates `DB_NAME` when it does not exist, and applies the following scripts in order:

1. `database/schema.sql`
2. `database/seed.sql`
3. `database/book-appointment.sql`

Run the command once against a fresh assessment database. The scripts intentionally use plain SQL files so they can also be inspected or applied with SQL Server tooling.

## Schema

| Table | Purpose | Key safeguards |
| --- | --- | --- |
| `Doctors` | Reference doctor records | Primary key |
| `Patients` | Reference patient records | Primary key |
| `AppointmentSlots` | Pre-created doctor time slots and availability | Primary key, doctor foreign key, valid status/time checks |
| `Appointments` | Completed bookings | Primary key, slot/patient foreign keys, unique `SlotId` |

The seed script creates one doctor, twenty patients (`5001`–`5020`), and two initially available slots (`101`, `102`). Slot `101` is used by the concurrency test.

## Booking procedure

`dbo.BookAppointment @SlotId, @PatientId` is the only application write path. It validates the patient, atomically changes the requested available slot to `Booked`, inserts the appointment, and commits. It uses `SET XACT_ABORT ON` and an explicit transaction, so any failure rolls back all changes.

For detailed simultaneous-request behaviour, see [CONCURRENCY-EXPLANATION.md](CONCURRENCY-EXPLANATION.md).

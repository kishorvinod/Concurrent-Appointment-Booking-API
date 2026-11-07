# How simultaneous booking conflicts are prevented

The implementation does not use the unsafe pattern of first selecting a slot and later inserting an appointment. Between those two operations, another request could book the same slot.

Instead, `dbo.BookAppointment` runs this guarded state transition inside a SQL Server transaction:

```sql
UPDATE dbo.AppointmentSlots
SET Status = 'Booked'
OUTPUT inserted.SlotId INTO @Claimed
WHERE SlotId = @SlotId AND Status = 'Available';
```

SQL Server locks the row while evaluating and executing this one statement. When two clients submit the same available slot simultaneously:

1. One request obtains the lock and changes `Available` to `Booked`.
2. The other request waits for that lock.
3. After the first transaction commits, the waiting request re-evaluates its condition. The status is now `Booked`, so it updates zero rows.
4. The procedure returns the defined `SLOT_ALREADY_BOOKED` business error, which Express maps to `409 Conflict`.

The successful state transition and `Appointments` insert are in the same `XACT_ABORT` transaction. If the insert or another operation fails, SQL Server rolls back the slot status change. Finally, `UNIQUE (Appointments.SlotId)` is an independent database-level safeguard: even a faulty future caller cannot persist two appointments for one slot.

The live integration suite verifies this with twenty concurrent HTTP requests and asserts exactly one success, nineteen conflicts, and one persisted appointment record.

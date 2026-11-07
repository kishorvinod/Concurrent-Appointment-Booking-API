CREATE OR ALTER PROCEDURE dbo.BookAppointment
    @SlotId INT,
    @PatientId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM dbo.Patients WHERE PatientId = @PatientId)
            THROW 50001, 'Patient not found.', 1;

        DECLARE @Claimed TABLE (SlotId INT NOT NULL);
        UPDATE dbo.AppointmentSlots
        SET Status = 'Booked'
        OUTPUT inserted.SlotId INTO @Claimed
        WHERE SlotId = @SlotId AND Status = 'Available';

        IF NOT EXISTS (SELECT 1 FROM @Claimed)
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM dbo.AppointmentSlots WHERE SlotId = @SlotId)
                THROW 50002, 'Appointment slot not found.', 1;
            THROW 50003, 'Appointment slot is already booked.', 1;
        END;

        INSERT dbo.Appointments (SlotId, PatientId) VALUES (@SlotId, @PatientId);
        DECLARE @AppointmentId INT = SCOPE_IDENTITY();
        COMMIT TRANSACTION;

        SELECT @AppointmentId AS appointmentId, @SlotId AS slotId, @PatientId AS patientId, BookedAt AS bookedAt
        FROM dbo.Appointments WHERE AppointmentId = @AppointmentId;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

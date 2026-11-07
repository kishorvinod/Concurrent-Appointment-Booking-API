INSERT dbo.Doctors (DoctorId, FullName) VALUES (1, 'Dr. Maya Nair');
INSERT dbo.Patients (PatientId, FullName) VALUES
 (5001, 'Patient 1'), (5002, 'Patient 2'), (5003, 'Patient 3'), (5004, 'Patient 4'), (5005, 'Patient 5'),
 (5006, 'Patient 6'), (5007, 'Patient 7'), (5008, 'Patient 8'), (5009, 'Patient 9'), (5010, 'Patient 10'),
 (5011, 'Patient 11'), (5012, 'Patient 12'), (5013, 'Patient 13'), (5014, 'Patient 14'), (5015, 'Patient 15'),
 (5016, 'Patient 16'), (5017, 'Patient 17'), (5018, 'Patient 18'), (5019, 'Patient 19'), (5020, 'Patient 20');
INSERT dbo.AppointmentSlots (SlotId, DoctorId, StartsAt, EndsAt) VALUES
 (101, 1, '2026-11-10T09:00:00', '2026-11-10T09:30:00'),
 (102, 1, '2026-11-10T09:30:00', '2026-11-10T10:00:00');

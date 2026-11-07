CREATE TABLE dbo.Doctors (
    DoctorId INT NOT NULL PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL
);

CREATE TABLE dbo.Patients (
    PatientId INT NOT NULL PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL
);

CREATE TABLE dbo.AppointmentSlots (
    SlotId INT NOT NULL PRIMARY KEY,
    DoctorId INT NOT NULL,
    StartsAt DATETIME2 NOT NULL,
    EndsAt DATETIME2 NOT NULL,
    Status VARCHAR(10) NOT NULL CONSTRAINT DF_AppointmentSlots_Status DEFAULT 'Available',
    CONSTRAINT FK_AppointmentSlots_Doctors FOREIGN KEY (DoctorId) REFERENCES dbo.Doctors(DoctorId),
    CONSTRAINT CK_AppointmentSlots_Time CHECK (EndsAt > StartsAt),
    CONSTRAINT CK_AppointmentSlots_Status CHECK (Status IN ('Available', 'Booked'))
);

CREATE TABLE dbo.Appointments (
    AppointmentId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SlotId INT NOT NULL,
    PatientId INT NOT NULL,
    BookedAt DATETIME2 NOT NULL CONSTRAINT DF_Appointments_BookedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Appointments_SlotId UNIQUE (SlotId),
    CONSTRAINT FK_Appointments_Slot FOREIGN KEY (SlotId) REFERENCES dbo.AppointmentSlots(SlotId),
    CONSTRAINT FK_Appointments_Patient FOREIGN KEY (PatientId) REFERENCES dbo.Patients(PatientId)
);

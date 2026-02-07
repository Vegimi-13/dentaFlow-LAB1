import prisma from "../prisma/client.js";

/**
 * Doctor creates medical record for a patient
 */
export const createMedicalRecord = async (doctorId, data) => {
  return prisma.medicalRecord.create({
    data: {
      ...data,
      doctorId,
    },
    include: {
      patient: true,
      doctor: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Doctor creates medical record from appointment
 */
export const createMedicalRecordFromAppointment = async (
  doctorId,
  appointmentId,
  data,
) => {
  // First, get the appointment to extract patient info
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.doctorId !== doctorId) {
    throw new Error("You can only create records for your own appointments");
  }

  // Security: Prevent editing completed appointments
  if (appointment.status === "COMPLETED") {
    throw new Error(
      "Cannot create or modify medical record for completed appointment",
    );
  }

  // Create medical record and mark appointment as completed in a transaction
  return prisma.$transaction(async (prisma) => {
    // Filter data to only include valid MedicalRecord fields
    const { diagnosis, treatment, notes, teeth } = data;
    const filteredData = { diagnosis, treatment, notes, teeth };

    // Create the medical record
    const record = await prisma.medicalRecord.create({
      data: {
        title: `Appointment ${new Date(appointment.date).toLocaleDateString()}`,
        patientId: appointment.patientId,
        doctorId,
        ...filteredData,
      },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Mark appointment as completed
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "COMPLETED" },
    });

    return record;
  });
};

/**
 * Admin / Doctor: get all records
 */
export const getAllMedicalRecords = async () => {
  return prisma.medicalRecord.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
      doctor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Get records for a specific patient
 */
export const getRecordsByPatient = async (patientId) => {
  return prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    include: {
      doctor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Doctor: get only his own records
 */
export const getRecordsByDoctor = async (doctorId) => {
  return prisma.medicalRecord.findMany({
    where: { doctorId },
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
    },
  });
};

/**
 * Patient: get only his own records
 */
export const getRecordsForPatientUser = async (patientId) => {
  return prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    include: {
      doctor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Patient: get medical records by user ID (includes user → patient mapping)
 */
export const getMedicalRecordsByUserId = async (userId) => {
  // Map USER → PATIENT
  const patient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (!patient) {
    return [];
  }

  return getRecordsForPatientUser(patient.id);
};

/**
 * Get medical record by appointment ID
 */
export const getMedicalRecordByAppointment = async (appointmentId) => {
  // First find the appointment to get patient and doctor info
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Find the most recent medical record for this patient and doctor
  // This is more reliable than matching by date since records are created when appointments are completed
  const record = await prisma.medicalRecord.findFirst({
    where: {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      },
      doctor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record) {
    throw new Error("No medical record found for this appointment");
  }

  return record;
};

/**
 * Get single medical record by ID with access control
 */
export const getMedicalRecord = async (id, userId, userRole) => {
  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      },
      doctor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!record) {
    throw new Error("Medical record not found");
  }

  // Access control: patients can only see their own records
  if (userRole === "PATIENT") {
    if (record.patient.userId !== userId) {
      throw new Error(
        "Access denied: You can only view your own medical records",
      );
    }
  }
  // Doctors can see records they created
  else if (userRole === "DOCTOR") {
    if (record.doctorId !== userId) {
      throw new Error("Access denied: You can only view records you created");
    }
  }
  // Admin can see all records (no additional check needed)

  return record;
};

/**
 * Doctor: update a record
 */
export const updateMedicalRecord = async (id, data) => {
  return prisma.medicalRecord.update({
    where: { id },
    data,
  });
};

/**
 * Admin: delete record
 */
export const deleteMedicalRecord = async (id) => {
  return prisma.medicalRecord.delete({
    where: { id },
  });
};

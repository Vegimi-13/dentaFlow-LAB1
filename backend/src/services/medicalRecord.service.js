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

  // Create medical record and mark appointment as completed in a transaction
  return prisma.$transaction(async (prisma) => {
    // Filter data to only include valid MedicalRecord fields
    const { diagnosis, treatment, notes } = data;
    const filteredData = { diagnosis, treatment, notes };

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
        select: { id: true, email: true },
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
        select: { id: true, email: true },
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
        select: { id: true, email: true },
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

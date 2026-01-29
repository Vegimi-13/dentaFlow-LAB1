import prisma from '../prisma/client.js'

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
  })
}

/**
 * Admin / Doctor: get all records
 */
export const getAllMedicalRecords = async () => {
  return prisma.medicalRecord.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      patient: true,
      doctor: {
        select: { id: true, email: true },
      },
    },
  })
}

/**
 * Get records for a specific patient
 */
export const getRecordsByPatient = async (patientId) => {
  return prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: {
      doctor: {
        select: { id: true, email: true },
      },
    },
  })
}

/**
 * Doctor: get only his own records
 */
export const getRecordsByDoctor = async (doctorId) => {
  return prisma.medicalRecord.findMany({
    where: { doctorId },
    orderBy: { createdAt: 'desc' },
    include: {
      patient: true,
    },
  })
}

/**
 * Patient: get only his own records
 */
export const getRecordsForPatientUser = async (patientId) => {
  return prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: {
      doctor: {
        select: { id: true, email: true },
      },
    },
  })
}

/**
 * Doctor: update a record
 */
export const updateMedicalRecord = async (id, data) => {
  return prisma.medicalRecord.update({
    where: { id },
    data,
  })
}

/**
 * Admin: delete record
 */
export const deleteMedicalRecord = async (id) => {
  return prisma.medicalRecord.delete({
    where: { id },
  })
}
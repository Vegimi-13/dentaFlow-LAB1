import prisma from '../prisma/client.js'

/**
 * CREATE patient
 */
export const createPatient = async (data) => {
  // Convert date string to DateTime if provided
  if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
    data.dateOfBirth = new Date(data.dateOfBirth)
  }
  
  return prisma.patient.create({
    data,
  })
}

/**
 * GET all patients
 */
export const getAllPatients = async () => {
  return prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * GET patient by ID
 */
export const getPatientById = async (id) => {
  return prisma.patient.findUnique({
    where: { id },
  })
}

/**
 * UPDATE patient
 */
export const updatePatient = async (id, data) => {
  // Convert date string to DateTime if provided
  if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
    data.dateOfBirth = new Date(data.dateOfBirth)
  }
  
  return prisma.patient.update({
    where: { id },
    data,
  })
}

/**
 * DELETE patient
 */
export const deletePatient = async (id) => {
  return prisma.patient.delete({
    where: { id },
  })
}


/**
 * PATIENT → create own profile
 */
export const createPatientForUser = async (userId, data) => {
  if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
    data.dateOfBirth = new Date(data.dateOfBirth)
  }

  return prisma.patient.create({
    data: {
      ...data,
      userId,
    },
  })
}

/**
 * PATIENT → get own profile
 */
export const getPatientByUserId = async (userId) => {
  return prisma.patient.findUnique({
    where: { userId },
  })
}

/**
 * PATIENT → update own profile
 */
export const updatePatientByUserId = async (userId, data) => {
  if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
    data.dateOfBirth = new Date(data.dateOfBirth)
  }

  return prisma.patient.update({
    where: { userId },
    data,
  })
}

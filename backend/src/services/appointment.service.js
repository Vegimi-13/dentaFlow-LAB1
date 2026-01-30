import prisma from '../prisma/client.js'

/**
 * PATIENT → book appointment
 */
export const createAppointment = async (patientId, data) => {
  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date: new Date(date),
      status: {
        not: "CANCELLED",
      },
    },
  })

  if (existing) {
    throw new Error("This time slot is already booked")
  }

  return prisma.appointment.create({
    data: {
      ...data,
      patientId,
    },
    include: {
      patient: true,
      doctor: {
        select: { id: true, email: true },
      },
    },
  })
}

/**
 * ADMIN / DOCTOR → get all appointments
 */
export const getAllAppointments = async () => {
  return prisma.appointment.findMany({
    orderBy: { date: 'asc' },
    include: {
      patient: true,
      doctor: {
        select: { id: true, email: true },
      },
    },
  })
}

/**
 * DOCTOR → get his schedule
 */
export const getAppointmentsByDoctor = async (doctorId) => {
  return prisma.appointment.findMany({
    where: { doctorId },
    orderBy: { date: 'asc' },
    include: {
      patient: true,
    },
  })
}

/**
 * PATIENT → get his appointments
 */
export const getAppointmentsByPatient = async (patientId) => {
  return prisma.appointment.findMany({
    where: { patientId },
    orderBy: { date: 'asc' },
    include: {
      doctor: {
        select: { id: true, email: true },
      },
    },
  })
}

/**
 * DOCTOR / ADMIN → update appointment
 */
export const updateAppointment = async (id, data) => {
  return prisma.appointment.update({
    where: { id },
    data,
  })
}

/**
 * ADMIN → delete appointment
 */
export const deleteAppointment = async (id) => {
  return prisma.appointment.delete({
    where: { id },
  })
}
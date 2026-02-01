import prisma from "../prisma/client.js";

// PATIENT → book appointment
// userId comes from JWT (req.user.id)

export const createAppointment = async (userId, data) => {
  const { doctorId, date, notes } = data;

  // 1️Resolve patient from user
  const patient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  const appointmentDate = new Date(date);

  //  Collision check
  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date: appointmentDate,
      status: { not: "CANCELLED" },
    },
  });

  if (existing) {
    throw new Error("This time slot is already booked");
  }

  // Create appointment
  return prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId,
      date: appointmentDate,
      notes,
    },
    include: {
      doctor: {
        select: { id: true, email: true },
      },
    },
  });
};

// PATIENT → get his appointments

export const getAppointmentsByUser = async (userId) => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (!patient) return [];

  return prisma.appointment.findMany({
    where: { patientId: patient.id },
    orderBy: { date: "asc" },
    include: {
      doctor: {
        select: { id: true, email: true },
      },
    },
  });
};

// DOCTOR → get his schedule

export const getAppointmentsByDoctor = async (doctorId) => {
  return prisma.appointment.findMany({
    where: { doctorId },
    orderBy: { date: "asc" },
    include: {
      patient: true,
    },
  });
};

// Get appointment by ID

export const getAppointmentById = async (id) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: {
        select: { id: true, email: true },
      },
    },
  });
};

// ADMIN / DOCTOR → get all appointments

export const getAllAppointments = async () => {
  return prisma.appointment.findMany({
    orderBy: { date: "asc" },
    include: {
      patient: true,
      doctor: {
        select: { id: true, email: true },
      },
    },
  });
};

// DOCTOR / ADMIN → update appointment

export const updateAppointment = async (id, data) => {
  return prisma.appointment.update({
    where: { id },
    data,
  });
};

// ADMIN → delete appointment

export const deleteAppointment = async (id) => {
  return prisma.appointment.delete({
    where: { id },
  });
};



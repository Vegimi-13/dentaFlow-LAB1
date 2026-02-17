import prisma from "../prisma/client.js";
import { sendAppointmentConfirmedEmail } from "../utils/mailer.js";

// Get available doctors for appointment booking
export const getAvailableDoctors = async () => {
  return prisma.user.findMany({
    where: {
      role: {
        name: "DOCTOR",
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });
};

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

// DOCTOR → get his schedule

export const getAppointmentsByDoctor = async (doctorId) => {
  return prisma.appointment.findMany({
    where: { doctorId },
    orderBy: { date: "asc" },
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
    },
  });
};

// Get appointment by ID

export const getAppointmentById = async (id) => {
  return prisma.appointment.findUnique({
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
        select: { id: true, email: true, firstName: true, lastName: true },
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
  // Security: Get current appointment to check status
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    throw new Error("Appointment not found");
  }

  // Security: Prevent updating completed appointments (except for status changes by admins)
  if (existingAppointment.status === "COMPLETED" && !data.status) {
    throw new Error("Cannot modify completed appointment");
  }
  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data,
    include: {
      patient: {
        include: {
          user: true,
        },
      },
      doctor: true,
    },
  });

  // 📧 Send email ONLY when status changes to CONFIRMED
  if (
    data.status === "CONFIRMED" &&
    existingAppointment.status !== "CONFIRMED"
  ) {
    await sendAppointmentConfirmedEmail(
      updatedAppointment.patient.user.email,
      `${updatedAppointment.doctor.firstName} ${updatedAppointment.doctor.lastName}`,
      updatedAppointment.date
    );
  }

  return updatedAppointment;
};

// ADMIN → delete appointment

export const deleteAppointment = async (id) => {
  return prisma.appointment.delete({
    where: { id },
  });
};

// ADMIN → get appointments by userId
export const getAppointmentsByUserId = async (userId) => {
  // find patient from user
  const patient = await prisma.patient.findUnique({
    where: { userId },
  });

  if (!patient) return [];

  return prisma.appointment.findMany({
    where: { patientId: patient.id },
    orderBy: { date: "asc" },
    include: {
      doctor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      patient: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};

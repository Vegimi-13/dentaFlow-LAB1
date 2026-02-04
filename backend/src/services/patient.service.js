import prisma from "../prisma/client.js";

/**
 * CREATE patient
 */
export const createPatient = async (data) => {
  // Separate User fields from Patient fields
  const { firstName, lastName, phone, email, ...patientData } = data;

  // Convert date string to DateTime if provided
  if (patientData.dateOfBirth && typeof patientData.dateOfBirth === "string") {
    patientData.dateOfBirth = new Date(patientData.dateOfBirth);
  }

  // If user fields are provided, update the associated user
  if (firstName || lastName || phone || email) {
    const userUpdateData = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (email !== undefined) userUpdateData.email = email;

    // Update the user if userId is provided and user fields exist
    if (patientData.userId && Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: patientData.userId },
        data: userUpdateData,
      });
    }
  }

  // Create patient with only Patient model fields
  return prisma.patient.create({
    data: patientData,
  });
};

/**
 * GET all patients
 */
export const getAllPatients = async () => {
  return prisma.patient.findMany({
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
    orderBy: { createdAt: "desc" },
  });
};

/**
 * GET patient by ID
 */
export const getPatientById = async (id) => {
  return prisma.patient.findUnique({
    where: { id },
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
  });
};

/**
 * UPDATE patient
 */
export const updatePatient = async (id, data) => {
  // Separate User fields from Patient fields
  const { firstName, lastName, phone, email, ...patientData } = data;

  // Convert date string to DateTime if provided
  if (patientData.dateOfBirth && typeof patientData.dateOfBirth === "string") {
    patientData.dateOfBirth = new Date(patientData.dateOfBirth);
  }

  // Get patient to find userId for updating user info
  if (firstName || lastName || phone || email) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (patient) {
      const userUpdateData = {};
      if (firstName !== undefined) userUpdateData.firstName = firstName;
      if (lastName !== undefined) userUpdateData.lastName = lastName;
      if (phone !== undefined) userUpdateData.phone = phone;
      if (email !== undefined) userUpdateData.email = email;

      await prisma.user.update({
        where: { id: patient.userId },
        data: userUpdateData,
      });
    }
  }

  return prisma.patient.update({
    where: { id },
    data: patientData,
  });
};

/**
 * DELETE patient
 */
export const deletePatient = async (id) => {
  return prisma.patient.delete({
    where: { id },
  });
};

/**
 * PATIENT → create own profile
 */
export const createPatientForUser = async (userId, data) => {
  // Separate User fields from Patient fields
  const { firstName, lastName, phone, email, ...patientData } = data;

  if (patientData.dateOfBirth && typeof patientData.dateOfBirth === "string") {
    patientData.dateOfBirth = new Date(patientData.dateOfBirth);
  }

  // Update user fields if provided
  if (firstName || lastName || phone || email) {
    const userUpdateData = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (email !== undefined) userUpdateData.email = email;

    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });
  }

  return prisma.patient.create({
    data: {
      ...patientData,
      userId,
    },
  });
};

/**
 * PATIENT → get own profile
 */
export const getPatientByUserId = async (userId) => {
  return prisma.patient.findUnique({
    where: { userId },
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
  });
};

/**
 * PATIENT → update own profile
 */
export const updatePatientByUserId = async (userId, data) => {
  // Separate User fields from Patient fields
  const { firstName, lastName, phone, email, ...patientData } = data;

  if (patientData.dateOfBirth && typeof patientData.dateOfBirth === "string") {
    patientData.dateOfBirth = new Date(patientData.dateOfBirth);
  }

  // Update user fields if provided
  if (firstName || lastName || phone || email) {
    const userUpdateData = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (email !== undefined) userUpdateData.email = email;

    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });
  }

  return prisma.patient.update({
    where: { userId },
    data: patientData,
  });
};

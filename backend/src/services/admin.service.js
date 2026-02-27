import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: {
        select: {
          name: true,
        },
      },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

//update password
export const updateUserPassword = async (userId, hashedPassword) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

export const createUser = async ({
  email,
  password,
  role,
  firstName,
  lastName,
  phone,
}) => {
  const hashed = await bcrypt.hash(password, 10);

  // Find the role by name to get its ID
  const roleRecord = await prisma.role.findUnique({
    where: { name: role },
  });

  if (!roleRecord) {
    throw new Error(`Role ${role} not found`);
  }

  return prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      phone,
      roleId: roleRecord.id,
    },
  });
};

export const updateUser = async (id, data) => {
  const updateData = { ...data };

  // If role is provided, convert role name to roleId
  if (data.role) {
    const roleRecord = await prisma.role.findUnique({
      where: { name: data.role },
    });

    if (!roleRecord) {
      throw new Error(`Role ${data.role} not found`);
    }

    updateData.roleId = roleRecord.id;
    delete updateData.role; // Remove role field as we use roleId
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
};

export const deleteUser = async (id) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      patient: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Start a transaction to ensure all deletions happen atomically
  return await prisma.$transaction(async (tx) => {
    // If user has a patient record, delete all related data
    if (user.patient) {
      // Delete medical records where this patient is the patient
      await tx.medicalRecord.deleteMany({
        where: { patientId: user.patient.id },
      });

      // Delete appointments where this patient is the patient
      await tx.appointment.deleteMany({
        where: { patientId: user.patient.id },
      });

      // Delete the patient record
      await tx.patient.delete({
        where: { id: user.patient.id },
      });
    }

    // Delete medical records where this user is the doctor
    await tx.medicalRecord.deleteMany({
      where: { doctorId: id },
    });

    // Delete appointments where this user is the doctor
    await tx.appointment.deleteMany({
      where: { doctorId: id },
    });

    // Finally, delete the user
    return await tx.user.delete({
      where: { id },
    });
  });
};

import * as medicalRecordService from "../services/medicalRecord.service.js";

/**
 * DOCTOR → create medical record for patient
 */
export const createMedicalRecord = async (req, res) => {
  try {
    const doctorId = req.user.id; // 🔥 doctor from token
    const record = await medicalRecordService.createMedicalRecord(
      doctorId,
      req.body,
    );

    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DOCTOR → create medical record from appointment
 */
export const createMedicalRecordFromAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointmentId = Number(req.params.appointmentId);
    const record =
      await medicalRecordService.createMedicalRecordFromAppointment(
        doctorId,
        appointmentId,
        req.body,
      );

    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ADMIN / DOCTOR → get all records
 */
export const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await medicalRecordService.getAllMedicalRecords();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ADMIN / DOCTOR → get records by patient
 */
export const getRecordsByPatient = async (req, res) => {
  try {
    const patientId = Number(req.params.patientId);
    const records = await medicalRecordService.getRecordsByPatient(patientId);
    res.json(records);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DOCTOR → get only his own records
 */
export const getMyRecords = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const records = await medicalRecordService.getRecordsByDoctor(doctorId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATIENT → get own medical records
 */
export const getMyMedicalRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const records =
      await medicalRecordService.getMedicalRecordsByUserId(userId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get medical record by appointment ID
 */
export const getMedicalRecordByAppointment = async (req, res) => {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const record =
      await medicalRecordService.getMedicalRecordByAppointment(appointmentId);
    res.json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get single medical record by ID
 */
export const getMedicalRecord = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role.name;

    const record = await medicalRecordService.getMedicalRecord(
      id,
      userId,
      userRole,
    );
    res.json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DOCTOR → update record
 */
export const updateMedicalRecord = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const record = await medicalRecordService.updateMedicalRecord(id, req.body);
    res.json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ADMIN → delete record
 */
export const deleteMedicalRecord = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await medicalRecordService.deleteMedicalRecord(id);
    res.json({ message: "Medical record deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

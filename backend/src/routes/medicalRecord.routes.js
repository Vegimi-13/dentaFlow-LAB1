import { Router } from "express";

import * as medicalRecordController from "../controllers/medicalRecord.controller.js";
import protect from "../middlewares/auth.middleware.js";
import allow from "../middlewares/role.middleware.js";

const router = Router();

// 🔒 All medical record routes require authentication
router.use(protect);

/**
 * DOCTOR → create medical record for a patient
 */
router.post("/", allow("DOCTOR"), medicalRecordController.createMedicalRecord);

/**
 * DOCTOR → create medical record from appointment
 */
router.post(
  "/from-appointment/:appointmentId",
  allow("DOCTOR"),
  medicalRecordController.createMedicalRecordFromAppointment,
);

/**
 * ADMIN / DOCTOR → get all medical records
 */
router.get(
  "/",
  allow("ADMIN", "DOCTOR"),
  medicalRecordController.getAllMedicalRecords,
);

/**
 * ADMIN / DOCTOR → get records for a specific patient
 */
router.get(
  "/patient/:patientId",
  allow("ADMIN", "DOCTOR"),
  medicalRecordController.getRecordsByPatient,
);

/**
 * DOCTOR → get only records he created
 */
router.get("/my", allow("DOCTOR"), medicalRecordController.getMyRecords);

/**
 * PATIENT → get own medical records
 */
router.get(
  "/me",
  allow("PATIENT"),
  medicalRecordController.getMyMedicalRecords,
);

/**
 * Get medical record by appointment ID
 */
router.get(
  "/by-appointment/:appointmentId",
  allow("DOCTOR"),
  medicalRecordController.getMedicalRecordByAppointment,
);

/**
 * Get single medical record by ID
 */
router.get("/:id", medicalRecordController.getMedicalRecord);

/**
 * DOCTOR → update medical record
 */
router.put(
  "/:id",
  allow("DOCTOR"),
  medicalRecordController.updateMedicalRecord,
);

/**
 * ADMIN → delete medical record
 */
router.delete(
  "/:id",
  allow("ADMIN"),
  medicalRecordController.deleteMedicalRecord,
);

router.get(
  "/patient/me",
  allow("PATIENT"),
  medicalRecordController.getMyMedicalRecords,
);

export default router;

import * as medicalRecordService from '../services/medicalRecord.service.js'

/**
 * DOCTOR → create medical record for patient
 */
export const createMedicalRecord = async (req, res) => {
  try {
    const doctorId = req.user.id // 🔥 doctor from token
    const record = await medicalRecordService.createMedicalRecord(
      doctorId,
      req.body
    )

    res.status(201).json(record)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * ADMIN / DOCTOR → get all records
 */
export const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await medicalRecordService.getAllMedicalRecords()
    res.json(records)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * ADMIN / DOCTOR → get records by patient
 */
export const getRecordsByPatient = async (req, res) => {
  try {
    const patientId = Number(req.params.patientId)
    const records = await medicalRecordService.getRecordsByPatient(patientId)
    res.json(records)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * DOCTOR → get only his own records
 */
export const getMyRecords = async (req, res) => {
  try {
    const doctorId = req.user.id
    const records = await medicalRecordService.getRecordsByDoctor(doctorId)
    res.json(records)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * PATIENT → get own medical records
 */
export const getMyMedicalRecords = async (req, res) => {
  try {
    const patientId = req.user.id
    const records = await medicalRecordService.getRecordsForPatientUser(
      patientId
    )
    res.json(records)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * DOCTOR → update record
 */
export const updateMedicalRecord = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const record = await medicalRecordService.updateMedicalRecord(id, req.body)
    res.json(record)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * ADMIN → delete record
 */
export const deleteMedicalRecord = async (req, res) => {
  try {
    const id = Number(req.params.id)
    await medicalRecordService.deleteMedicalRecord(id)
    res.json({ message: 'Medical record deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
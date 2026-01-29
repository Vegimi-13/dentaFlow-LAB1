import * as patientService from '../services/patient.service.js'

/**
 * CREATE patient
 */
export const createPatient = async (req, res) => {
  try {
    const patient = await patientService.createPatient(req.body)
    res.status(201).json(patient)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * GET all patients
 */
export const getAllPatients = async (req, res) => {
  try {
    const patients = await patientService.getAllPatients()
    res.json(patients)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * GET patient by ID
 */
export const getPatientById = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const patient = await patientService.getPatientById(id)

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' })
    }

    res.json(patient)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * UPDATE patient
 */
export const updatePatient = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const patient = await patientService.updatePatient(id, req.body)
    res.json(patient)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * DELETE patient
 */
export const deletePatient = async (req, res) => {
  try {
    const id = Number(req.params.id)
    await patientService.deletePatient(id)
    res.json({ message: 'Patient deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}


/**
 * PATIENT → create own profile
 */
export const createMyProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const patient = await patientService.createPatientForUser(userId, req.body)
    res.status(201).json(patient)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * PATIENT → get own profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const patient = await patientService.getPatientByUserId(userId)

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' })
    }

    res.json(patient)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * PATIENT → update own profile
 */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const patient = await patientService.updatePatientByUserId(
      userId,
      req.body
    )
    res.json(patient)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

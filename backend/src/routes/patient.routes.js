import { Router } from 'express'

import * as patientController from '../controllers/patient.controller.js'
import protect from '../middlewares/auth.middleware.js'
import allow from '../middlewares/role.middleware.js'

const router = Router()

// 🔒 All patient routes require authentication
router.use(protect)

// ➕ Create patient (ADMIN, DOCTOR)
router.post('/', allow('ADMIN', 'DOCTOR'), patientController.createPatient)

// 📄 Get all patients (ADMIN, DOCTOR)
router.get('/', allow('ADMIN', 'DOCTOR'), patientController.getAllPatients)

// 📄 Get one patient by ID (ADMIN, DOCTOR)
router.get('/:id', allow('ADMIN', 'DOCTOR'), patientController.getPatientById)

// ✏ Update patient (ADMIN, DOCTOR)
router.put('/:id', allow('ADMIN', 'DOCTOR'), patientController.updatePatient)

// ❌ Delete patient (ADMIN only)
router.delete('/:id', allow('ADMIN'), patientController.deletePatient)

export default router

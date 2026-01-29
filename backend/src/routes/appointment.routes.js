import { Router } from 'express'

import * as appointmentController from '../controllers/appointment.controller.js'
import protect from '../middlewares/auth.middleware.js'
import allow from '../middlewares/role.middleware.js'

const router = Router()

// 🔒 All appointment routes require authentication
router.use(protect)

/**
 * PATIENT → book appointment
 */
router.post(
  '/',
  allow('PATIENT'),
  appointmentController.createAppointment
)

/**
 * ADMIN / DOCTOR → get all appointments
 */
router.get(
  '/',
  allow('ADMIN', 'DOCTOR'),
  appointmentController.getAllAppointments
)

/**
 * DOCTOR → get his schedule
 */
router.get(
  '/doctor/me',
  allow('DOCTOR'),
  appointmentController.getMyDoctorAppointments
)

/**
 * PATIENT → get his bookings
 */
router.get(
  '/patient/me',
  allow('PATIENT'),
  appointmentController.getMyPatientAppointments
)

/**
 * DOCTOR / ADMIN → update appointment (status, date, notes)
 */
router.put(
  '/:id',
  allow('DOCTOR', 'ADMIN'),
  appointmentController.updateAppointment
)

/**
 * ADMIN → delete appointment
 */
router.delete(
  '/:id',
  allow('ADMIN'),
  appointmentController.deleteAppointment
)

export default router
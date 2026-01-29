import * as appointmentService from '../services/appointment.service.js'

/**
 * PATIENT → book appointment
 */
export const createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id
    const appointment = await appointmentService.createAppointment(
      patientId,
      req.body
    )
    res.status(201).json(appointment)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * ADMIN / DOCTOR → get all appointments
 */
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments()
    res.json(appointments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * DOCTOR → get his schedule
 */
export const getMyDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id
    const appointments =
      await appointmentService.getAppointmentsByDoctor(doctorId)
    res.json(appointments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * PATIENT → get his bookings
 */
export const getMyPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id
    const appointments =
      await appointmentService.getAppointmentsByPatient(patientId)
    res.json(appointments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * DOCTOR / ADMIN → update appointment
 */
export const updateAppointment = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const appointment = await appointmentService.updateAppointment(
      id,
      req.body
    )
    res.json(appointment)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * ADMIN → delete appointment
 */
export const deleteAppointment = async (req, res) => {
  try {
    const id = Number(req.params.id)
    await appointmentService.deleteAppointment(id)
    res.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
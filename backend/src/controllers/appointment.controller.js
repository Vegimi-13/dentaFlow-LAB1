import * as appointmentService from "../services/appointment.service.js";

//  PATIENT → book appointment

export const createAppointment = async (req, res) => {
  try {
    const { date, doctorId, notes } = req.body;

    if (!date || !doctorId) {
      return res.status(400).json({
        error: "date and doctorId are required",
      });
    }

    const appointment = await appointmentService.createAppointment(
      req.user.id,
      { date, doctorId, notes },
    );

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//  PATIENT → get his bookings

export const getMyPatientAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByUser(
      req.user.id,
    );

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// DOCTOR → get his schedule

export const getMyDoctorAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByDoctor(
      req.user.id,
    );

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADMIN / DOCTOR → get all appointments

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DOCTOR / ADMIN → update appointment

export const updateAppointment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const appointment = await appointmentService.updateAppointment(
      id,
      req.body,
    );
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ADMIN → delete appointment

export const deleteAppointment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await appointmentService.deleteAppointment(id);
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



//GET Appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const id = Number(req.params.id)

    const appointment = await appointmentService.getAppointmentById(id)

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    res.json(appointment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

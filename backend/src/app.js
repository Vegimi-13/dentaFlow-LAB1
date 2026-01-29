import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import patientRoutes from './routes/patient.routes.js'
import medicalRecordRoutes from './routes/medicalRecord.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/records', medicalRecordRoutes)
app.use('/api/appointments', appointmentRoutes)

export default app

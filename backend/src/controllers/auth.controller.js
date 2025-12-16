import * as authService from '../services/auth.service.js'

const register = async (req, res) => {
  try {
    const { email, password, role } = req.body
    const user = await authService.register(email, password, role)
    res.status(201).json({ message: 'User registered', user })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.json(result)
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
}

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body
    const result = await authService.refresh(refreshToken)
    res.json(result)
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
}

export default {
  register,
  login,
  refresh,
}

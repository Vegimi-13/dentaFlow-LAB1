import * as authService from '../services/auth.service.js'

const register = async (req, res) => {
  console.log('Register endpoint hit')
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
    
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    // Only send access token in response
    res.json({ accessToken: result.accessToken })
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
}

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' })
    }
    
    const result = await authService.refresh(refreshToken)
    res.json(result)
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
}


const logout = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out successfully' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export default {
  register,
  login,
  refresh,
  logout,
}

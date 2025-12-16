import jwt from 'jsonwebtoken'

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization

  // 1. Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' })
  }

  // 2. Expect format: Bearer TOKEN
  const [type, token] = authHeader.split(' ')
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Invalid authorization format' })
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // attach user info to request
    req.user = decoded

    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export default protect

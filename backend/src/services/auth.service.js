import prisma from '../prisma/client.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js'

/**
 * REGISTER
 */
export const register = async (email, password, roleName = 'PATIENT') => {
  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('Email already exists')
  }

  // 2. Get role from roles table
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  })

  if (!role) {
    throw new Error('Invalid role')
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password)

  // 4. Create user with roleId
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      roleId: role.id,
    },
    include: { role: true },
  })

  return {
    id: user.id,
    email: user.email,
    role: user.role.name,
  }
}

/**
 * LOGIN
 */
export const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const valid = await comparePassword(password, user.password)
  if (!valid) {
    throw new Error('Invalid credentials')
  }

  const accessToken = generateAccessToken({
    id: user.id,
    email:user.email,
    role: user.role.name,
  })

  const refreshToken = generateRefreshToken({
    id: user.id,
  })

  // store refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  })

  return { accessToken, refreshToken }
}

/**
 * REFRESH ACCESS TOKEN
 */
export const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token missing')
  }

  const payload = verifyRefreshToken(refreshToken)

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    include: { role: true },
  })

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error('Invalid refresh token')
  }

  const newAccessToken = generateAccessToken({
    id: user.id,
    role: user.role.name,
  })

  return { accessToken: newAccessToken }
}

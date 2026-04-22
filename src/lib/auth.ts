import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

export async function verifyAdmin(email: string, password: string): Promise<AdminUser | null> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email, active: true }
    })

    if (!admin) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    
    if (!isValidPassword) {
      return null
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function createAdmin(email: string, name: string, password: string, role: string = 'admin') {
  const hashedPassword = await bcrypt.hash(password, 12)
  
  return await prisma.admin.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role
    }
  })
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export function verifyToken(token: string) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || ''
    return jwt.verify(token, secret) as { id: string; email: string; role: string }
  } catch {
    return null
  }
}
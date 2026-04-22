/**
 * Translate Prisma + validation errors into proper HTTP responses.
 *
 * Usage in admin route handlers:
 *   try { ... } catch (err) { return handlePrismaError(err, 'Proizvod') }
 */
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export function handlePrismaError(err: unknown, resourceLabel = 'Resurs'): NextResponse {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const fields = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'polje'
        return NextResponse.json(
          { error: `${resourceLabel} sa istim ${fields} već postoji.`, code: 'DUPLICATE', field: fields },
          { status: 409 },
        )
      }
      case 'P2025':
        // Record not found
        return NextResponse.json(
          { error: `${resourceLabel} nije pronađen.`, code: 'NOT_FOUND' },
          { status: 404 },
        )
      case 'P2003':
        // Foreign key constraint
        return NextResponse.json(
          { error: `${resourceLabel} je u upotrebi i ne može se obrisati.`, code: 'FK_CONFLICT' },
          { status: 409 },
        )
      case 'P2000':
        return NextResponse.json(
          { error: 'Vrednost je preduga.', code: 'TOO_LONG' },
          { status: 400 },
        )
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: 'Neispravni podaci.', code: 'INVALID' },
      { status: 400 },
    )
  }

  if (err instanceof ValidationError) {
    return NextResponse.json(
      { error: err.message, code: 'INVALID', field: err.field },
      { status: 400 },
    )
  }

  console.error('[handlePrismaError] unknown error:', err)
  return NextResponse.json(
    { error: 'Server greška. Pokušajte ponovo.', code: 'SERVER_ERROR' },
    { status: 500 },
  )
}

/** Throw this from route handlers to short-circuit into a 400 with a friendly message. */
export class ValidationError extends Error {
  field?: string
  constructor(message: string, field?: string) {
    super(message)
    this.field = field
    this.name = 'ValidationError'
  }
}

/** Require a field; throw ValidationError if missing or empty. */
export function requireField<T>(value: T, fieldName: string): NonNullable<T> {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`Polje "${fieldName}" je obavezno.`, fieldName)
  }
  return value as NonNullable<T>
}

/**
 * Order status state machine — shared between server enforcement and client UI.
 *
 * Server: rejects illegal transitions with 400.
 * Client: disables options in the status <select> that aren't in allowed transitions.
 *
 * Keep this file framework-agnostic (no Next.js, no Prisma) so it works in
 * both route handlers and client components.
 */

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Na čekanju',
  confirmed: 'Potvrđena',
  shipped: 'Poslata',
  delivered: 'Isporučena',
  cancelled: 'Otkazana',
}

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // terminal
  cancelled: ['pending'], // allow reactivation
}

/** Is the transition from → to allowed? */
export function isAllowedTransition(from: OrderStatus, to: OrderStatus): boolean {
  return (ORDER_STATUS_FLOW[from] ?? []).includes(to)
}

/** Return the set of statuses the admin should see in a select when current status is `from`. */
export function allowedNextStatuses(from: OrderStatus): OrderStatus[] {
  // Always include the current status so the admin can see where they are.
  return [from, ...(ORDER_STATUS_FLOW[from] ?? [])]
}

export function isValidStatus(s: string): s is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(s)
}

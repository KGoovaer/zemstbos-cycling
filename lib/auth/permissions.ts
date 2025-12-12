import { Session } from 'next-auth'

export type UserRole = 'admin' | 'member'

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'admin'
}

export function isMember(session: Session | null): boolean {
  return session?.user?.role === 'member' || session?.user?.role === 'admin'
}

export function canManageMembers(session: Session | null): boolean {
  return isAdmin(session)
}

export function canManageRoutes(session: Session | null): boolean {
  return isAdmin(session)
}

export function canManageSchedule(session: Session | null): boolean {
  return isAdmin(session)
}

export function canViewMemberContent(session: Session | null): boolean {
  return isMember(session)
}

export function canDownloadGPX(session: Session | null): boolean {
  return isMember(session)
}

export function requireAuth(session: Session | null): asserts session is Session {
  if (!session) {
    throw new Error('Authentication required')
  }
}

export function requireAdmin(session: Session | null): asserts session is Session {
  requireAuth(session)
  if (!isAdmin(session)) {
    throw new Error('Admin access required')
  }
}

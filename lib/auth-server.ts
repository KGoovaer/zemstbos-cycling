import NextAuth from 'next-auth'
import { authConfig } from './auth'

const { auth: getAuth } = NextAuth(authConfig)

export const auth = getAuth

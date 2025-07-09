'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser, getCurrentSession, setCompanyContext, setUserContext } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  name: string
  role: 'owner' | 'administrator' | 'user'
  companyId: string
  emailVerified: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: AuthUser; accessToken: string }>
  signUp: (email: string, password: string, name: string, companyId?: string) => Promise<{ user: AuthUser; accessToken: string }>
  signOut: () => Promise<void>
  updateUser: (userData: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const session = await getCurrentSession()
        if (session?.user) {
          await handleAuthUser(session.user)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleAuthUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthUser = async (supabaseUser: User) => {
    try {
      // Fetch additional user data from our users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error || !userData) {
        console.error('Error fetching user data:', error)
        return
      }

      // Set contexts for RLS
      await setCompanyContext(userData.company_id)
      await setUserContext(userData.id)

      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        companyId: userData.company_id,
        emailVerified: userData.email_verified,
      }

      setUser(authUser)
    } catch (error) {
      console.error('Error handling auth user:', error)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ user: AuthUser; accessToken: string }> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user || !data.session) {
        throw new Error('No user data returned')
      }

      await handleAuthUser(data.user)

      return {
        user: user!,
        accessToken: data.session.access_token,
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    name: string,
    companyId?: string
  ): Promise<{ user: AuthUser; accessToken: string }> => {
    setLoading(true)
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('No user data returned from auth signup')
      }

      // Then create the user record in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          company_id: companyId,
          role: companyId ? 'user' : 'owner',
          active: true,
          email_verified: false,
        })
        .select()
        .single()

      if (userError) {
        // Clean up auth user if user creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw userError
      }

      // Set contexts for RLS
      await setCompanyContext(userData.company_id)
      await setUserContext(userData.id)

      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        companyId: userData.company_id,
        emailVerified: userData.email_verified,
      }

      setUser(authUser)

      return {
        user: authUser,
        accessToken: authData.session?.access_token || '',
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
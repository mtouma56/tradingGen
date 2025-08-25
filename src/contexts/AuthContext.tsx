import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseAvailable } from '../lib/supabase'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isSupabaseEnabled: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const isSupabaseEnabled = isSupabaseAvailable()

  useEffect(() => {
    if (!isSupabaseEnabled) {
      // Mode développement sans Supabase - créer un utilisateur fictif
      const mockUser = {
        id: 'mock-user-id',
        email: 'admin@tradinghevea.local',
        full_name: 'Administrateur',
        role: 'admin' as const
      }
      
      setProfile(mockUser)
      setLoading(false)
      return
    }

    // Récupérer la session actuelle
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [isSupabaseEnabled])

  const loadProfile = async (userId: string) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role || 'user'
        })
      }
    } catch (error) {
      console.error('Error in loadProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: null } // Mode développement
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: null } // Mode développement
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    return { error }
  }

  const signOut = async () => {
    if (!supabase) {
      setProfile(null)
      return
    }

    await supabase.auth.signOut()
  }

  const isAuthenticated = isSupabaseEnabled ? !!session : !!profile

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    isSupabaseEnabled
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
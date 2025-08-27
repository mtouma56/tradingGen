// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase, isSupabaseEnabled } from "../lib/supabase"

// --- Context types ---
interface AuthContextValue {
  user: User | null
  profile: any | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isSupabaseEnabled: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        if (!isSupabaseEnabled) {
          // Dev mode: no Supabase configured → not authenticated but app can render
          if (isMounted) {
            setSession(null)
            setUser(null)
            setLoading(false)
          }
          return
        }
        // Get current session
        const { data, error } = await supabase.auth.getSession()
        if (error) console.warn("supabase.getSession error:", error)
        if (isMounted) {
          setSession(data.session)
          setUser(data.session?.user ?? null)
          setLoading(false)
        }
        // Subscribe to auth changes
        const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
          setSession(sess)
          setUser(sess?.user ?? null)
        })
        return () => {
          sub.subscription.unsubscribe()
        }
      } catch (e) {
        console.error(e)
        if (isMounted) setLoading(false)
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseEnabled) {
      // Dev mode: simulate OK
      return { data: { user: null }, error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    if (!isSupabaseEnabled) return
    const { error } = await supabase.auth.signOut()
    if (error) console.error("supabase.signOut error:", error)
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile: user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    isSupabaseEnabled,
    signIn,
    signOut,
  }), [user, session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
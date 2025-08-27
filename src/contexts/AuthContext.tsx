// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react"
import { createClient, Session, User } from "@supabase/supabase-js"
import { Profile } from "../types"

// --- Supabase client (from Vite env) ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as any)

// --- Context types ---
interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
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
  const [profile, setProfile] = useState<Profile | null>(null)
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
            setProfile(null)
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
          setProfile(null)
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

  // Load profile when user changes
  useEffect(() => {
    let active = true
    async function loadProfile() {
      if (!isSupabaseEnabled || !user) {
        if (active) setProfile(null)
        return
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        if (error) {
          console.warn("supabase.getProfile error:", error)
        }
        if (active) setProfile(data ?? null)
      } catch (e) {
        console.error(e)
        if (active) setProfile(null)
      }
    }
    loadProfile()
    return () => {
      active = false
    }
  }, [user])

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
    session,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    isSupabaseEnabled,
    signIn,
    signOut,
  }), [user, session, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
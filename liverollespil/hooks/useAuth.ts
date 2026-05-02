'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth(requiredRole?: 'gm' | 'player') {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        setLoading(false)
        return
      }

      setUser(userData.user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

      setRole(profile?.role || null)
      setLoading(false)
    }

    load()
  }, [])

  const isAuthorized =
    user &&
    (!requiredRole || role === requiredRole)

  return {
    user,
    role,
    loading,
    isAuthorized
  }
}
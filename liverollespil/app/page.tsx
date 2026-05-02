'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

      if (profile?.role === 'gm') {
        router.push('/admin')
        return
      }

      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <a href="/create-character" className="block underline">
        Opret karakter
      </a>

      <a href="/my-characters" className="block underline">
        Mine karakterer
      </a>

      <button
        onClick={handleLogout}
        className="mt-4 bg-black text-white px-4 py-2"
      >
        Log ud
      </button>
    </div>
  )
}
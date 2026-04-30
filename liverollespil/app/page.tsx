'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
    })
  }, [])

  if (!user) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <a href="/create-character" className="block underline">
        Opret karakter
      </a>

      <a href="/my-characters" className="block underline">
        Mine karakterer
      </a>

      <a href="/admin" className="block underline">
        GM dashboard
      </a>

      <button
        onClick={() => supabase.auth.signOut()}
        className="mt-4 bg-black text-white px-4 py-2"
      >
        Logout
      </button>
    </div>
  )
}
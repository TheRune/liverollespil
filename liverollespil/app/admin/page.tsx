'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const router = useRouter()
  const [characters, setCharacters] = useState<any[]>([])
  
  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      router.push('/login')
      return
    }

    if (user.email !== GM_EMAIL) {
      router.push('/')
      return
    }

    setAuthorized(true)
  }

  if (authorized === null) {
    return <div className="p-6">Checking access...</div>
  }

  useEffect(() => {
    load()
  }, [])
  const GM_EMAIL = process.env.ADMIN_EMAIL

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user?.email !== GM_EMAIL) {
      return alert('Not authorized')
    }
    const { data } = await supabase
      .from('characters')
      .select('*, races(name)')

    setCharacters(data || [])
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">GM Dashboard</h1>
      <a href="/admin/abilities" className="underline">
        Administrer evner
      </a>

      {characters.map(c => (
        <div key={c.id} className="border p-4 mt-2">
          <h2>{c.character_name}</h2>
          <p>Spiller: {c.player_name}</p>
          <p>Race: {c.races?.name}</p>
        </div>
      ))}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [characters, setCharacters] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase
      .from('characters')
      .select('*, races(name)')

    setCharacters(data || [])
  }
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">GM Dashboard</h1>
      <a href="/admin/abilities" className="underline">
        Administrer evner
      </a>

      <a href="/admin/sessions" className="underline">
        Administrer spilgange
      </a>

      {characters.map(c => (
        <div key={c.id} className="border p-4 mt-2">
          <h2>{c.character_name}</h2>
          <p>Spiller: {c.player_name}</p>
          <p>Race: {c.races?.name}</p>
        </div>
      ))}

      <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 mt-4"
    >
      Log ud
    </button>
    </div>
  )
}
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
      <a href="/admin/abilities" className="button mt-4 bg-gray-200 px-4 py-2 rounded block w-max">
        Administrer evner
      </a>

      <a href="/admin/races" className="button mt-4 bg-gray-200 px-4 py-2 rounded block w-max">
        Administrer races
      </a>

      <a href="/admin/sessions" className="button mt-4 bg-gray-200 px-4 py-2 rounded block w-max">
        Administrer spilgange
      </a>

      {characters.map(c => (
        <div key={c.id} className="border p-4 mt-2">
          <h2>{c.character_name}</h2>
          <p>Spiller: {c.player_name}</p>
          <p>Race: {c.races?.name}</p>
        </div>
      ))}
      <div className="mt-6 border-t pt-4">
      <button
        onClick={handleLogout}
        className="mt-4 bg-black text-white px-4 py-2"
      >
        Log ud
      </button>
      </div>
    </div>
  )
}
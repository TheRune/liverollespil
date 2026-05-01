'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin() {
  const [characters, setCharacters] = useState<any[]>([])
  
  useEffect(() => {
    load()
  }, [])

  const load = async () => {
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
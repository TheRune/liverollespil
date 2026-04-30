'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MyCharacters() {
  const [characters, setCharacters] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return

    const { data } = await supabase
      .from('characters')
      .select('*, races(name)')
      .eq('user_id', user.id)

    setCharacters(data || [])
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Mine karakterer</h1>

      {characters.map(c => (
        <div key={c.id} className="border p-4 mt-2">
          <h2 className="font-bold">{c.character_name}</h2>
          <p>Spiller: {c.player_name}</p>
          <p>Race: {c.races?.name}</p>
        </div>
      ))}
    </div>
  )
}
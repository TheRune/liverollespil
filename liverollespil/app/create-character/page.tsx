'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreateCharacter() {
  const [races, setRaces] = useState<any[]>([])
  const [abilities, setAbilities] = useState<any[]>([])

  const [playerName, setPlayerName] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [raceId, setRaceId] = useState('')
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: racesData } = await supabase.from('races').select('*')
    const { data: abilitiesData } = await supabase.from('abilities').select('*')

    setRaces(racesData || [])
    setAbilities(abilitiesData || [])
  }

  const toggleAbility = (id: string) => {
    setSelectedAbilities(prev => {
      if (prev.includes(id)) {
        return prev.filter(a => a !== id)
      }

      if (prev.length >= 5) {
        alert('Max 5 evner')
        return prev
      }

      return [...prev, id]
    })
  }
  
  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return alert('Not logged in')

    // create character
    const { data: character } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        player_name: playerName,
        character_name: characterName,
        race_id: raceId
      })
      .select()
      .single()

    // add abilities
    if (character) {
      const inserts = selectedAbilities.map(id => ({
        character_id: character.id,
        ability_id: id
      }))

      await supabase.from('character_abilities').insert(inserts)
    }

    alert('Character created!')
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Create Character</h1>

      <input
        className="w-full border p-2"
        placeholder="Spillernavn"
        value={playerName}
        onChange={e => setPlayerName(e.target.value)}
      />

      <input
        className="w-full border p-2"
        placeholder="Karakternavn"
        value={characterName}
        onChange={e => setCharacterName(e.target.value)}
      />

      <select
        className="w-full border p-2"
        value={raceId}
        onChange={e => setRaceId(e.target.value)}
      >
        <option value="">Vælg race</option>
        {races.map(r => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      <div>
        <h2 className="font-bold">Evner</h2>
        <div className="grid grid-cols-2 gap-2">
          {abilities.map(a => (
            <button
              key={a.id}
              onClick={() => toggleAbility(a.id)}
              className={`border p-2 ${
                selectedAbilities.includes(a.id)
                  ? 'bg-black text-white'
                  : ''
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white p-2"
      >
        Opret karakter
      </button>
    </div>
  )
}
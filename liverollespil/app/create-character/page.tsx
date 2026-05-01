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
    const { data: abilitiesData } = await supabase
      .from('abilities')
      .select(`
        *,
        ability_requirements(required_ability_id),
        ability_conflicts(conflicting_ability_id)
      `)

    setRaces(racesData || [])
    setAbilities(abilitiesData || [])
  }
  
  const toggleAbility2 = (id: string) => {
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
  const toggleAbility = (id: string) => {
    setSelectedAbilities(prev => {
      const ability = abilities.find(a => a.id === id)

      if (!ability) return prev

      // fjern hvis allerede valgt
      if (prev.includes(id)) {
        return prev.filter(a => a !== id)
      }

      // max 5
      if (prev.length >= 5) {
        alert('Max 5 evner')
        return prev
      }

      // tjek requirements
      const missingReqs = ability.ability_requirements?.filter(
        (req: any) => !prev.includes(req.required_ability_id)
      )

      if (missingReqs?.length > 0) {
        alert('Mangler krav for denne evne')
        return prev
      }

      // tjek conflicts
      const hasConflict = ability.ability_conflicts?.some(
        (conf: any) => prev.includes(conf.conflicting_ability_id)
      )

      if (hasConflict) {
        alert('Konflikt med valgt evne')
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
          {abilities.map(a => {
            const isSelected = selectedAbilities.includes(a.id)

            const missingReqs = a.ability_requirements?.some(
              (req: any) => !selectedAbilities.includes(req.required_ability_id)
            )

            const hasConflict = a.ability_conflicts?.some(
              (conf: any) => selectedAbilities.includes(conf.conflicting_ability_id)
            )

            const disabled = missingReqs || hasConflict

            return (
              <button
                key={a.id}
                disabled={disabled}
                onClick={() => toggleAbility(a.id)}
                className={`border p-2 ${
                  isSelected ? 'bg-black text-white' : ''
                } ${disabled ? 'opacity-50' : ''}`}
              >
                {a.name}
              </button>
            )
          })}
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
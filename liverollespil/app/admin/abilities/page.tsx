'use client'

export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BackButton from '@/components/BackButton'

export default function AbilityAdmin() {
  const [abilities, setAbilities] = useState<any[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase
      .from('abilities')
      .select('*')
      .order('name')
    setAbilities(data || [])
  }

  const createAbility = async () => {
    await supabase.from('abilities').insert({
      name,
      type,
      description
    })

    setName('')
    setType('')
    setDescription('')
    load()
  }

  const addRequirement = async (abilityId: string, requiredId: string) => {
    await supabase.from('ability_requirements').insert({
        ability_id: abilityId,
        required_ability_id: requiredId
    })
  }

  const addConflict = async (abilityId: string, conflictId: string) => {
    await supabase.from('ability_conflicts').insert({
        ability_id: abilityId,
        conflicting_ability_id: conflictId
    })
  }

  return (
    <div className="p-6 space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold">GM – Evner</h1>

      {/* Opret */}
      <div className="border p-4 space-y-2">
        <h2 className="font-bold">Opret evne</h2>

        <input
          className="border p-2 w-full"
          placeholder="Navn"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Type (fysisk, mental, magi)"
          value={type}
          onChange={e => setType(e.target.value)}
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Beskrivelse"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <button
          onClick={createAbility}
          className="bg-green-600 text-white px-4 py-2"
        >
          Opret
        </button>
      </div>

      {/* Liste */}
      <div>
        <h2 className="font-bold">Alle evner</h2>

        {abilities.map(a => (
          <div key={a.id} className="border p-3 mt-2">
            <strong>{a.name}</strong>
            <p>{a.type}</p>
            <p className="text-sm">{a.description}</p>
            <select onChange={(e) => addRequirement(a.id, e.target.value)} className="border p-1 mt-2">
                <option value="">Tilføj krav</option>
                {abilities.map(other => (
                    <option key={other.id} value={other.id}>
                    {other.name}
                    </option>
                ))}
            </select>
            <select onChange={(e) => addConflict(a.id, e.target.value)} className="border p-1 mt-2">
                <option value="">Tilføj konflikt</option>
                {abilities.map(other => (
                    <option key={other.id} value={other.id}>
                    {other.name}
                    </option>
                ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
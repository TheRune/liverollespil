'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import BackButton from '@/components/BackButton'

interface Race {
  id: string
  name: string
  description?: string | null
}

export default function RaceAdmin() {
  interface Ability {
    id: string
    name: string
  }

  const [races, setRaces] = useState<Race[]>([])
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const load = async () => {
    const { data } = await supabase
      .from('races')
      .select('*')
      .order('name')

    setRaces(data || [])
  }

  const loadAbilities = async () => {
    const { data } = await supabase
      .from('abilities')
      .select('*')
      .order('name')

    setAbilities(data || [])
  }

  useEffect(() => {
    const loadData = async () => {
      await load()
      await loadAbilities()
    }

    loadData()
  }, [])

  const toggleAbility = (id: string) => {
    setSelectedAbilities(prev =>
      prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]
    )
  }

  const createRace = async () => {
    if (!name.trim()) {
      alert('Navn er påkrævet')
      return
    }

    const { data, error } = await supabase
      .from('races')
      .insert({
        name: name.trim(),
        description: description.trim() || null
      })
      .select()
      .single()

    if (error) {
      alert(error.message)
      return
    }

    if (data && selectedAbilities.length > 0) {
      await supabase.from('race_abilities').insert(
        selectedAbilities.map(ability_id => ({
          race_id: data.id,
          ability_id
        }))
      )
    }

    setName('')
    setDescription('')
    setSelectedAbilities([])
    load()
  }

  const deleteRace = async (id: string) => {
    if (!confirm('Slet race? Dette kan påvirke eksisterende karakterer.')) {
      return
    }

    await supabase.from('races').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-6 space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold">GM – Racer</h1>

      <div className="border p-4 space-y-3">
        <h2 className="font-bold">Opret race</h2>

        <input
          className="border p-2 w-full"
          placeholder="Navn"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Beskrivelse"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
        />

        <div>
          <h3 className="font-medium mb-2">Start-evner</h3>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {abilities.map(ability => {
              const isSelected = selectedAbilities.includes(ability.id)

              return (
                <button
                  key={ability.id}
                  type="button"
                  onClick={() => toggleAbility(ability.id)}
                  className={`border p-2 text-left rounded ${
                    isSelected ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {ability.name}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={createRace}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Opret
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Alle racer</h2>

        {races.length === 0 ? (
          <p className="text-gray-500">Ingen racer er oprettet endnu.</p>
        ) : (
          races.map(race => (
            <div key={race.id} className="border p-4 rounded space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{race.name}</div>
                  <p className="text-sm text-gray-600">{race.description || 'Ingen beskrivelse'}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/races/${race.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Rediger
                  </Link>
                  <button
                    onClick={() => deleteRace(race.id)}
                    className="text-red-600"
                  >
                    Slet
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

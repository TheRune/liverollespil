'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BackButton from '@/components/BackButton'

interface Race {
  id: string
  name: string
  description?: string | null
}

export default function RaceEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  interface Ability {
    id: string
    name: string
  }

  interface RaceAbilityRow {
    ability_id: string
  }

  const [race, setRace] = useState<Race | null>(null)
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      const { data: raceData, error: raceError } = await supabase
        .from('races')
        .select('*')
        .eq('id', id)
        .single()

      if (raceError) {
        setError(raceError.message)
        return
      }

      setRace(raceData)
      setName(raceData?.name || '')
      setDescription(raceData?.description || '')

      const { data: abilitiesData } = await supabase
        .from('abilities')
        .select('*')
        .order('name')

      setAbilities(abilitiesData || [])

      const { data: selectedRows } = await supabase
        .from('race_abilities')
        .select('ability_id')
        .eq('race_id', id)

      setSelectedAbilities((selectedRows as RaceAbilityRow[] | null)?.map(row => row.ability_id) || [])
    }

    loadData()
  }, [id])

  const toggleAbility = (abilityId: string) => {
    setSelectedAbilities(prev =>
      prev.includes(abilityId)
        ? prev.filter(value => value !== abilityId)
        : [...prev, abilityId]
    )
  }

  const saveRace = async () => {
    if (!name.trim()) {
      alert('Navn er påkrævet')
      return
    }

    const { error } = await supabase
      .from('races')
      .update({ name: name.trim(), description: description.trim() || null })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    await supabase.from('race_abilities').delete().eq('race_id', id)

    if (selectedAbilities.length > 0) {
      await supabase.from('race_abilities').insert(
        selectedAbilities.map(ability_id => ({
          race_id: id,
          ability_id
        }))
      )
    }

    router.push('/admin/races')
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <BackButton />
        <div className="text-red-600">Der opstod en fejl: {error}</div>
      </div>
    )
  }

  if (!race) {
    return (
      <div className="p-6">
        <BackButton />
        <p>Indlæser racer…</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold">Rediger race</h1>

      <div className="border p-4 space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="race-name">
            Navn
          </label>
          <input
            id="race-name"
            className="border p-2 w-full"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="race-description">
            Beskrivelse
          </label>
          <textarea
            id="race-description"
            rows={6}
            className="border p-2 w-full"
            value={description || ''}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div>
          <h3 className="font-medium mb-2">Start-evner</h3>
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
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

        <div className="flex gap-3">
          <button
            onClick={saveRace}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Gem ændringer
          </button>
          <Link href="/admin/races" className="px-4 py-2 bg-gray-200 rounded">
            Annuller
          </Link>
        </div>
      </div>
    </div>
  )
}

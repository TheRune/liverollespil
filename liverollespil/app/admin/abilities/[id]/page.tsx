'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Ability {
  id: string
  name: string
  type: string
  description: string
}

export default function AbilityEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [ability, setAbility] = useState<Ability | null>(null)
  const [allAbilities, setAllAbilities] = useState<Ability[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState<string[]>([])
  const [conflicts, setConflicts] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadAbility()
      loadAllAbilities()
    }
  }, [id])

  const loadAbility = async () => {
    const { data, error: fetchError } = await supabase
      .from('abilities')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    if (data) {
      setAbility(data)
      setName(data.name || '')
      setType(data.type || '')
      setDescription(data.description || '')
    }

    // Load requirements and conflicts
    const { data: reqs } = await supabase
      .from('ability_requirements')
      .select('required_ability_id')
      .eq('ability_id', id)

    const { data: confs } = await supabase
      .from('ability_conflicts')
      .select('conflicting_ability_id')
      .eq('ability_id', id)

    setRequirements(reqs?.map(r => r.required_ability_id) || [])
    setConflicts(confs?.map(c => c.conflicting_ability_id) || [])
  }

  const loadAllAbilities = async () => {
    const { data } = await supabase
      .from('abilities')
      .select('*')
      .order('name')

    setAllAbilities(data || [])
  }

  const toggleRequirement = (abilityId: string) => {
    setRequirements(prev =>
      prev.includes(abilityId)
        ? prev.filter(id => id !== abilityId)
        : [...prev, abilityId]
    )
  }

  const toggleConflict = (abilityId: string) => {
    setConflicts(prev =>
      prev.includes(abilityId)
        ? prev.filter(id => id !== abilityId)
        : [...prev, abilityId]
    )
  }

  const saveAbility = async () => {
    setSaving(true)
    setError('')

    // Update ability data
    const { error: updateError } = await supabase
      .from('abilities')
      .update({ name, type, description })
      .eq('id', id)

    if (updateError) {
      setSaving(false)
      setError(updateError.message)
      return
    }

    // Delete existing requirements and conflicts
    await supabase.from('ability_requirements').delete().eq('ability_id', id)
    await supabase.from('ability_conflicts').delete().eq('ability_id', id)

    // Insert new requirements
    if (requirements.length > 0) {
      const reqs = requirements.map(req_id => ({
        ability_id: id,
        required_ability_id: req_id
      }))
      await supabase.from('ability_requirements').insert(reqs)
    }

    // Insert new conflicts
    if (conflicts.length > 0) {
      const confs = conflicts.map(conf_id => ({
        ability_id: id,
        conflicting_ability_id: conf_id
      }))
      await supabase.from('ability_conflicts').insert(confs)
    }

    setSaving(false)
    router.push('/admin/abilities')
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Link href="/admin/abilities" className="text-blue-600 hover:underline">
          ← Tilbage til evner
        </Link>
        <div className="text-red-600">Der opstod en fejl: {error}</div>
      </div>
    )
  }

  if (!ability) {
    return (
      <div className="p-6">
        <Link href="/admin/abilities" className="text-blue-600 hover:underline">
          ← Tilbage til evner
        </Link>
        <p className="mt-4">Indlæser evne…</p>
      </div>
    )
  }

  const otherAbilities = allAbilities.filter(a => a.id !== id)

  return (
    <div className="p-6 space-y-6">
      <Link href="/admin/abilities" className="text-blue-600 hover:underline">
        ← Tilbage til evner
      </Link>

      <h1 className="text-2xl font-bold">Rediger evne</h1>
      <div className="border p-4 space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="ability-name">
            Navn
          </label>
          <input
            id="ability-name"
            className="border p-2 w-full"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="ability-type">
            Type
          </label>
          <input
            id="ability-type"
            className="border p-2 w-full"
            value={type}
            onChange={(event) => setType(event.target.value)}
            placeholder="fysisk, mental, magi"
          />
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="ability-description">
            Beskrivelse
          </label>
          <textarea
            id="ability-description"
            rows={10}
            className="border p-2 w-full min-h-[220px]"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">
            Brug tekstfeltet til at skrive en komplet beskrivelse. Du kan senere udskifte denne textarea med en markdown- eller rich-text editor, hvis du ønsker.
          </p>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Krav (evner denne skal kræve)</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto border p-2">
            {otherAbilities.length === 0 ? (
              <p className="text-gray-500 text-sm">Ingen andre evner tilgængelige</p>
            ) : (
              otherAbilities.map(ability => (
                <label key={ability.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requirements.includes(ability.id)}
                    onChange={() => toggleRequirement(ability.id)}
                    className="w-4 h-4"
                  />
                  <span>{ability.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Konflikter (evner denne ikke kan kombineres med)</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto border p-2">
            {otherAbilities.length === 0 ? (
              <p className="text-gray-500 text-sm">Ingen andre evner tilgængelige</p>
            ) : (
              otherAbilities.map(ability => (
                <label key={ability.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conflicts.includes(ability.id)}
                    onChange={() => toggleConflict(ability.id)}
                    className="w-4 h-4"
                  />
                  <span>{ability.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={saveAbility}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Gemmer…' : 'Gem ændringer'}
          </button>
          <Link href="/admin/abilities" className="px-4 py-2 bg-gray-200 rounded">
            Annuller
          </Link>
        </div>
      </div>
    </div>
  )
}


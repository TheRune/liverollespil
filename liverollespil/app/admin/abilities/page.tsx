'use client'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BackButton from '@/components/BackButton'
import EmojiPicker from '../../../components/EmojiPicker'

interface AbilityWithRelations {
  id: string
  name: string
  type: string
  description: string
  icon?: string
  requirements: string[]
  conflicts: string[]
}

export default function AbilityAdmin() {
  const [abilities, setAbilities] = useState<AbilityWithRelations[]>([])
  const [abilityMap, setAbilityMap] = useState<Record<string, string>>({})
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    // Load all abilities
    const { data: abilitiesData } = await supabase
      .from('abilities')
      .select('*')
      .order('name')

    if (!abilitiesData) {
      setAbilities([])
      return
    }

    // Create a map of ability ID to name for quick lookup
    const map: Record<string, string> = {}
    abilitiesData.forEach(a => {
      map[a.id] = a.name
    })
    setAbilityMap(map)

    // Load relationships for each ability
    const abilitiesWithRelations = await Promise.all(
      abilitiesData.map(async (ability) => {
        const { data: reqs } = await supabase
          .from('ability_requirements')
          .select('required_ability_id')
          .eq('ability_id', ability.id)

        const { data: confs } = await supabase
          .from('ability_conflicts')
          .select('conflicting_ability_id')
          .eq('ability_id', ability.id)

        return {
          ...ability,
          requirements: reqs?.map(r => r.required_ability_id) || [],
          conflicts: confs?.map(c => c.conflicting_ability_id) || []
        }
      })
    )

    setAbilities(abilitiesWithRelations)
  }

  const createAbility = async () => {
    await supabase.from('abilities').insert({
      name,
      type,
      description,
      icon
    })

    setName('')
    setType('')
    setDescription('')
    setIcon('')
    load()
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

        <div className="space-y-2">
          <input
            className="border p-2 w-full"
            placeholder="Vælg eller skriv emoji (fx ⚔️)"
            value={icon}
            onChange={e => setIcon(e.target.value)}
            maxLength={5}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEmojiPickerOpen(true)}
              className="border px-3 py-2 rounded text-sm"
            >
              Vælg emoji
            </button>
            {icon ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              <span className="text-sm text-gray-500">Ingen emoji valgt</span>
            )}
          </div>
        </div>

        <button
          onClick={createAbility}
          className="bg-green-600 text-white px-4 py-2"
        >
          Opret
        </button>
      </div>

      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onSelect={(emoji) => {
          setIcon(emoji)
          setEmojiPickerOpen(false)
        }}
        onClose={() => setEmojiPickerOpen(false)}
      />

      {/* Liste */}
      <div>
        <h2 className="font-bold">Alle evner</h2>

        {abilities.map(a => (
          <div key={a.id} className="relative border p-3 mt-2 space-y-2">
            <Link
              href={`/admin/abilities/${a.id}`}
              className="absolute right-3 top-3 text-sm text-blue-600 hover:text-blue-800"
              aria-label={`Rediger ${a.name}`}
            >
              ✏️
            </Link>
            <div>
              <div className="text-lg font-semibold flex items-center gap-2">
                {a.icon && <span className="text-2xl">{a.icon}</span>}
                {a.name}
              </div>
              <p className="text-sm text-gray-500">{a.type}</p>
            </div>
            <p className="text-sm">{a.description}</p>
            
            {a.requirements.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm font-medium text-gray-700">Krav:</p>
                <ul className="text-sm list-disc list-inside text-gray-600">
                  {a.requirements.map(reqId => (
                    <li key={reqId}>{abilityMap[reqId] || 'Ukendt evne'}</li>
                  ))}
                </ul>
              </div>
            )}

            {a.conflicts.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm font-medium text-gray-700">Konflikter:</p>
                <ul className="text-sm list-disc list-inside text-gray-600">
                  {a.conflicts.map(confId => (
                    <li key={confId}>{abilityMap[confId] || 'Ukendt evne'}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
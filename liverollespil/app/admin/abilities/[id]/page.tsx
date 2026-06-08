'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Ability {
  id: string
  name: string
  type: string
  description: string
}

interface PageProps {
  params: {
    id: string
  }
}

export default function AbilityEditPage({ params }: PageProps) {
  const router = useRouter()
  const [ability, setAbility] = useState<Ability | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAbility()
  }, [params.id])

  const loadAbility = async () => {
    const { data, error: fetchError } = await supabase
      .from('abilities')
      .select('*')
      .eq('id', params.id)
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
  }

  const saveAbility = async () => {
    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('abilities')
      .update({ name, type, description })
      .eq('id', params.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

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

        <div className="flex gap-3">
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

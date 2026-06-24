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

  const [race, setRace] = useState<Race | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    loadRace()
  }, [id])

  const loadRace = async () => {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      setError(error.message)
      return
    }

    setRace(data)
    setName(data?.name || '')
    setDescription(data?.description || '')
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

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BackButton from '@/components/BackButton'

export default function SessionsAdmin() {
  const [characters, setCharacters] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [activeSession, setActiveSession] = useState<any>(null)
  const [sessionCharacters, setSessionCharacters] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    // alle karakterer
    const { data: chars } = await supabase
      .from('characters')
      .select('id, character_name, level')
      .order('character_name')

    setCharacters(chars || [])

    // aktiv spilgang
    const { data: session } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('is_active', true)
      .single()

    if (session) {
      setActiveSession(session)

      const { data: sc } = await supabase
        .from('game_session_characters')
        .select(`
          id,
          characters(id, character_name, level)
        `)
        .eq('session_id', session.id)

      setSessionCharacters(sc || [])
    }
  }

  // 🔍 filtrering
  const filtered = characters.filter(c =>
    c.character_name.toLowerCase().includes(search.toLowerCase())
  )

  // ✅ toggle select
  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  // ➕ tilmeld spilgang
  const addToSession = async () => {
    let session = activeSession

    if (!session) {
      const { data: newSession } = await supabase
        .from('game_sessions')
        .insert({})
        .select()
        .single()

      session = newSession
      setActiveSession(session)
    }

    for (const id of selected) {
      await supabase.from('game_session_characters').insert({
        session_id: session.id,
        character_id: id
      })
    }

    setSelected([])
    load()
  }

  // ❌ fjern fra session
  const removeFromSession = async (id: string) => {
    await supabase
      .from('game_session_characters')
      .delete()
      .eq('id', id)

    load()
  }

  // 🏁 afslut spilgang
  const finishSession = async () => {
    if (!activeSession) return

    // level up alle deltagere
    for (const sc of sessionCharacters) {
      await supabase
        .from('characters')
        .update({
          level: sc.characters.level + 1
        })
        .eq('id', sc.characters.id)
    }

    // luk session
    await supabase
      .from('game_sessions')
      .update({
        is_active: false,
        played_at: new Date().toISOString()
      })
      .eq('id', activeSession.id)

    setActiveSession(null)
    setSessionCharacters([])
    load()
  }

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      <BackButton />

      {/* VENSTRE: alle karakterer */}
      <div>
        <h2 className="text-xl font-bold mb-2">Karakterer</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Søg..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {filtered.map(c => (
          <div key={c.id} className="flex justify-between border p-2 mb-1">
            <span>
              {c.character_name} (lvl {c.level})
            </span>

            <input
              type="checkbox"
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
            />
          </div>
        ))}

        <button
          onClick={addToSession}
          className="mt-3 bg-blue-600 text-white px-4 py-2"
        >
          Tilmeld spilgang
        </button>
      </div>

      {/* HØJRE: aktiv spilgang */}
      <div>
        <h2 className="text-xl font-bold mb-2">Spilgang</h2>

        {!activeSession && <p>Ingen aktiv spilgang</p>}

        {sessionCharacters.map(sc => (
          <div key={sc.id} className="flex justify-between border p-2 mb-1">
            <span>
              {sc.characters.character_name} (lvl {sc.characters.level})
            </span>

            <button
              onClick={() => removeFromSession(sc.id)}
              className="text-red-600"
            >
              Fjern
            </button>
          </div>
        ))}

        {activeSession && (
          <button
            onClick={finishSession}
            className="mt-4 bg-green-600 text-white px-4 py-2"
          >
            Spilgang afsluttet
          </button>
        )}
      </div>
    </div>
  )
}
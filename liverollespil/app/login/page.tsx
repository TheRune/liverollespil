'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
    }
  }

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Registration successful! Please check your email to confirm your account.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="p-6 border rounded-xl w-80 space-y-4">
        <h1 className="text-xl font-bold">Login</h1>

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>

        <button
          onClick={handleRegister}
          className="w-full bg-gray-500 text-white p-2 rounded"
        >
          Opret dig som bruger
        </button>

        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  )
}
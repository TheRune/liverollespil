'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { loading, isAuthorized } = useAuth('gm')
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthorized) {
      router.push('/')
    }
  }, [loading, isAuthorized])

  if (loading) return <div className="p-6">Loading...</div>
  if (!isAuthorized) return null

  return <>{children}</>
}
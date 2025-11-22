'use client'

import { useConnections } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * ProtectedRoute Component
 * Wraps protected pages that require wallet connection
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourProtectedContent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const connections = useConnections()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  
  // Check if any connection is active
  const isConnected = connections.length > 0

  useEffect(() => {
    // Small delay to allow connections to initialize
    const timer = setTimeout(() => {
      setIsChecking(false)
      if (!isConnected) {
        // Redirect to home page if not connected
        router.push('/')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isConnected, router])

  // Show loading state while checking connection
  if (isChecking) {
    return (
      <main className="container mx-auto py-8 px-4">
        <section className="max-w-2xl mx-auto">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </section>
      </main>
    )
  }

  // Don't render children if not connected (will redirect)
  if (!isConnected) {
    return null
  }

  // Render protected content if connected
  return <>{children}</>
}


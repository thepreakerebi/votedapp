'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, queryClientConfig } from '@/lib/wagmi.config'
import { Toaster } from '@/components/ui/sonner'
import { useState } from 'react'

/**
 * Providers Component
 * Wraps the app with wagmi and React Query providers
 * Must be a client component since wagmi requires client-side execution
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance (must be created inside component to avoid SSR issues)
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

